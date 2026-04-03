-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS "vector";

-- Documents table (source files/knowledge)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('file', 'webpage', 'text', 'url', 'notion', 'slack', 'email')),
  source_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  is_indexed BOOLEAN DEFAULT false,
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks (embedded pieces)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunk embeddings (stored vectors)
CREATE TABLE IF NOT EXISTS public.chunk_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  embedding vector(1536),
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_id)
);

-- Knowledge Graph Tables
CREATE TABLE IF NOT EXISTS public.kg_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}',
  source_chunk_ids UUID[],
  confidence FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.kg_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_entity_id UUID REFERENCES public.kg_entities(id) ON DELETE CASCADE NOT NULL,
  target_entity_id UUID REFERENCES public.kg_entities(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  strength FLOAT DEFAULT 1.0,
  bidirectional BOOLEAN DEFAULT false,
  properties JSONB DEFAULT '{}',
  source_chunk_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_entity_id, target_entity_id, relationship_type)
);

-- RLS for RAG tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunk_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own chunks" ON public.document_chunks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own embeddings" ON public.chunk_embeddings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own entities" ON public.kg_entities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own relationships" ON public.kg_relationships FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON public.document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_user_id ON public.chunk_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_kg_entities_user_id ON public.kg_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_user_id ON public.kg_relationships(user_id);

-- Update match_document_chunks function to join with embeddings
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (ce.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  INNER JOIN chunk_embeddings ce ON dc.id = ce.chunk_id
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_document_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION match_document_chunks TO anon;
