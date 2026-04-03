import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface Document {
  id: string;
  user_id: string;
  title: string;
  source_type: 'file' | 'webpage' | 'text' | 'url' | 'notion' | 'slack' | 'email';
  source_url?: string;
  file_name?: string;
  file_type?: string;
  content_text?: string;
  metadata?: Record<string, unknown>;
  is_indexed: boolean;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  content_hash: string;
  token_count: number;
}

export interface ChunkEmbedding {
  id: string;
  chunk_id: string;
  embedding: number[];
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string, chunkSize: number = CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = Math.ceil(sentence.split(/\s+/).length * 1.3);
    
    if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
      currentTokens = 0;
    }
    
    currentChunk += (currentChunk ? '. ' : '') + sentence;
    currentTokens += sentenceTokens;
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export function createContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function generateEmbeddingWithKey(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function findSimilarChunks(
  userId: string,
  queryEmbedding: number[],
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<{ chunk: DocumentChunk; similarity: number }[]> {
  const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
    user_id: userId,
  });

  if (error) {
    console.error('Error finding similar chunks:', error);
    return [];
  }

  return data || [];
}

export async function ingestDocument(
  userId: string,
  title: string,
  content: string,
  sourceType: Document['source_type'] = 'text',
  sourceUrl?: string,
  metadata?: Record<string, unknown>
): Promise<{ documentId: string; chunksIndexed: number }> {
  const { data: doc, error: docError } = await supabaseAdmin
    .from('documents')
    .insert({
      user_id: userId,
      title,
      source_type: sourceType,
      source_url: sourceUrl,
      content_text: content,
      metadata: metadata || {},
      is_indexed: false,
    })
    .select()
    .single();

  if (docError) throw docError;

  const chunks = chunkText(content);
  const chunkInserts = chunks.map((chunk, index) => ({
    document_id: doc.id,
    user_id: userId,
    chunk_index: index,
    content: chunk,
    content_hash: createContentHash(chunk),
    token_count: Math.ceil(chunk.split(/\s+/).length * 1.3),
  }));

  const { data: insertedChunks, error: chunkError } = await supabaseAdmin
    .from('document_chunks')
    .insert(chunkInserts)
    .select();

  if (chunkError) throw chunkError;

  // Generate and store embeddings for each chunk
  for (let i = 0; i < insertedChunks.length; i++) {
    try {
      const embedding = await generateEmbedding(insertedChunks[i].content);
      await supabaseAdmin.from('chunk_embeddings').insert({
        chunk_id: insertedChunks[i].id,
        user_id: userId,
        embedding: embedding,
      });
    } catch (embErr) {
      console.error('Failed to embed chunk:', embErr);
    }
  }

  await supabaseAdmin
    .from('documents')
    .update({ is_indexed: true, indexed_at: new Date().toISOString() })
    .eq('id', doc.id);

  return {
    documentId: doc.id,
    chunksIndexed: insertedChunks?.length || 0,
  };
}

export async function searchDocuments(
  userId: string,
  query: string,
  topK: number = 5
): Promise<{ content: string; metadata: Record<string, unknown>; similarity: number }[]> {
  try {
    const embedding = await generateEmbedding(query);
    
    const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: topK,
      user_id: userId,
    });

    if (error || !data) {
      return [];
    }

    return data.map((item: { content: string; metadata: Record<string, unknown>; similarity: number }) => ({
      content: item.content,
      metadata: item.metadata || {},
      similarity: item.similarity,
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function buildContextFromDocuments(
  userId: string,
  query: string,
  maxTokens: number = 4000
): Promise<string> {
  const results = await searchDocuments(userId, query, 10);
  
  let context = '';
  let totalTokens = 0;
  
  for (const result of results) {
    const tokens = result.content.split(/\s+/).length * 1.3;
    if (totalTokens + tokens > maxTokens) break;
    
    context += `\n\n[Document: ${result.metadata?.title || 'Unknown'}]\n${result.content}`;
    totalTokens += tokens;
  }
  
  return context;
}
