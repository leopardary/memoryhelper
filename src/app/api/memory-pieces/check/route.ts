import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/utils';
import MemoryPiece from '@/lib/db/model/MemoryPiece';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const content = searchParams.get('content');

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    await connectDB();

    // Find memory piece by exact content match
    const memoryPiece = await MemoryPiece.findOne({ content: content.trim() }).lean();

    if (!memoryPiece) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // Return existing memory piece data
    return NextResponse.json({
      exists: true,
      memoryPiece: {
        content: memoryPiece.content,
        description: memoryPiece.description || '',
        labels: memoryPiece.labels || [],
        imageUrls: memoryPiece.imageUrls || [],
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking memory piece:', error);
    return NextResponse.json(
      { error: 'Failed to check memory piece' },
      { status: 500 }
    );
  }
}
