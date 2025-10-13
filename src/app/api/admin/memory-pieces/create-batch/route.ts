import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { hasPermission } from "@/lib/utils/permissions";
import { addMemoryPieceToUnit } from "@/lib/db/api/memory-piece";
import { getUnit } from "@/lib/db/api/unit";

interface MemoryPieceInput {
  content: string;
  description?: string;
  imageUrls: string[];
  labels: string[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { unitId, memoryPieces } = body as {
      unitId: string;
      memoryPieces: MemoryPieceInput[];
    };

    if (!unitId || !memoryPieces || !Array.isArray(memoryPieces) || memoryPieces.length === 0) {
      return NextResponse.json(
        { error: 'Missing unitId or memoryPieces array' },
        { status: 400 }
      );
    }

    // Get unit to check subject permissions
    const unit = await getUnit(unitId);
    if (!unit || !unit.subject) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const subjectId = unit.subject._id?.toString() || unit.subject.toString();
    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);

    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create all memory pieces
    const results = [];
    for (const piece of memoryPieces) {
      if (!piece.content || piece.content.trim().length === 0) {
        continue; // Skip empty entries
      }

      const result = await addMemoryPieceToUnit({
        unitId,
        content: piece.content,
        description: piece.description,
        imageUrls: piece.imageUrls || [],
        labels: piece.labels || [],
      });

      results.push(result);
    }

    return NextResponse.json({
      message: `Successfully created ${results.length} memory pieces`,
      count: results.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Batch create memory pieces error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create memory pieces',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
