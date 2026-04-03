import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments } from '@/lib/rag';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, top_k = 5, user_id } = body;

    if (!query || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: query, user_id' },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.slice(0, 2000).trim();
    if (!sanitizedQuery) {
      return NextResponse.json(
        { error: 'Invalid search query' },
        { status: 400 }
      );
    }

    const results = await searchDocuments(user_id, sanitizedQuery, top_k);

    return NextResponse.json({
      query: sanitizedQuery,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('RAG search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

