import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getSubscriptionsDueToCheckForUser } from "@/lib/db/api/subscription";
import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";

export async function GET(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const subscriptionsDue = await getSubscriptionsDueToCheckForUser(auth.userId);
  const memoryPieceIds = subscriptionsDue.map(s => s.memoryPieceId.toString());
  const memoryPieces = await findMemoryPiecesInBatch(memoryPieceIds);

  const memoryPieceMap = new Map(memoryPieces.map((mp: any) => [mp.id, mp]));

  return NextResponse.json(subscriptionsDue.map((s: any) => {
    const mp = memoryPieceMap.get(s.memoryPieceId.toString());
    return {
      _id: s.id,
      userId: s.userId.toString(),
      memoryPieceId: s.memoryPieceId.toString(),
      status: s.status,
      easeFactor: s.easeFactor,
      currentInterval: s.currentInterval,
      nextTestDate: s.nextTestDate,
      memoryPiece: mp ? {
        _id: mp.id,
        content: mp.content,
        description: mp.description,
        labels: mp.labels,
        imageUrls: mp.imageUrls,
      } : null,
    };
  }));
}
