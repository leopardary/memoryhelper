import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db/utils';
import MemoryPiece from '@/lib/db/model/MemoryPiece';

export async function GET() {
  try {
    await connectDB();

    // Get all unique labels from memory pieces
    const labels = await MemoryPiece.distinct('labels');

    // Filter out empty strings and sort
    const validLabels = labels
      .filter((label: string) => label && label.trim().length > 0)
      .sort();

    return NextResponse.json({ labels: validLabels }, { status: 200 });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}
