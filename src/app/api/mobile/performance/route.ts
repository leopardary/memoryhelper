import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getSubscriptionWithMemoryPiecesAndChecksForUser } from "@/lib/db/api/subscription";

export async function GET(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const subscriptions = await getSubscriptionWithMemoryPiecesAndChecksForUser(auth.userId);

  const result: Record<string, any> = {};
  for (const [subscriptionId, rawData] of Object.entries(subscriptions)) {
    const data = rawData as any;
    result[subscriptionId] = {
      subscription: {
        userId: data.subscription.userId.toString(),
        memoryPieceId: data.subscription.memoryPieceId.toString(),
        status: data.subscription.status,
        easeFactor: data.subscription.easeFactor,
        currentInterval: data.subscription.currentInterval,
        nextTestDate: data.subscription.nextTestDate,
      },
      memoryPiece: data.memoryPiece ? {
        _id: data.memoryPiece.id,
        content: data.memoryPiece.content,
        imageUrls: data.memoryPiece.imageUrls,
        description: data.memoryPiece.description,
        labels: data.memoryPiece.labels,
      } : null,
      memoryChecks: data.memoryChecks?.map((mc: any) => ({
        _id: mc.id,
        subscription: mc.subscription.toString(),
        score: mc.score,
        createdAt: mc.createdAt,
        updatedAt: mc.updatedAt,
      })),
    };
  }

  return NextResponse.json(result);
}
