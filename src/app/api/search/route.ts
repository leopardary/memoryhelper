import { NextRequest, NextResponse } from 'next/server';
import { searchMemoryPieces } from '@/lib/db/api/memory-piece';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchMemoryPieces(query, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search memory pieces' },
      { status: 500 }
    );
  }
}
