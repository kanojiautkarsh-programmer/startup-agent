import { NextRequest, NextResponse } from 'next/server';
import { ingestDocument } from '@/lib/rag';

export const runtime = 'edge';

interface IngestRequest {
  content: string;
  title: string;
  source_type?: 'file' | 'webpage' | 'text' | 'url' | 'notion' | 'slack' | 'email';
  source_url?: string;
  metadata?: Record<string, unknown>;
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequest = await request.json();
    const { content, title, source_type = 'text', source_url, metadata = {}, user_id } = body;

    if (!content || !title || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: content, title, user_id' },
        { status: 400 }
      );
    }

    const result = await ingestDocument(
      user_id,
      title,
      content,
      source_type,
      source_url,
      metadata
    );

    return NextResponse.json({
      document_id: result.documentId,
      chunks_indexed: result.chunksIndexed,
      status: 'ready'
    });
  } catch (error) {
    console.error('RAG ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

