import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getSubscriptionsForUser, deleteSubscriptionForUserAndMemoryPiece } from "@/lib/db/api/subscription";
import { findOrCreateSubscription } from "@/lib/db/api/subscription";
import { initializeSubscription } from "@/lib/utils/subscriptionUtils";

// GET /api/mobile/subscriptions — all subscriptions for current user
export async function GET(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const subscriptions = await getSubscriptionsForUser(auth.userId);

  return NextResponse.json(subscriptions.map((s: any) => ({
    _id: s.id,
    userId: s.userId.toString(),
    memoryPieceId: s.memoryPieceId.toString(),
    status: s.status,
    easeFactor: s.easeFactor,
    currentInterval: s.currentInterval,
    nextTestDate: s.nextTestDate,
    memoryPiece: s.memoryPiece?.[0] ? {
      _id: s.memoryPiece[0].id,
      content: s.memoryPiece[0].content,
      description: s.memoryPiece[0].description,
      labels: s.memoryPiece[0].labels,
      imageUrls: s.memoryPiece[0].imageUrls,
    } : null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  })));
}

// POST /api/mobile/subscriptions — subscribe to a memory piece
export async function POST(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { memoryPieceId } = await req.json();
  if (!memoryPieceId) {
    return NextResponse.json({ error: "memoryPieceId is required" }, { status: 400 });
  }

  const subscription = await findOrCreateSubscription(
    initializeSubscription(memoryPieceId, auth.userId)
  );

  return NextResponse.json({
    _id: subscription.id,
    userId: subscription.userId.toString(),
    memoryPieceId: subscription.memoryPieceId.toString(),
    status: subscription.status,
    easeFactor: subscription.easeFactor,
    currentInterval: subscription.currentInterval,
    nextTestDate: subscription.nextTestDate,
  });
}

// DELETE /api/mobile/subscriptions — unsubscribe
export async function DELETE(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { memoryPieceId } = await req.json();
  if (!memoryPieceId) {
    return NextResponse.json({ error: "memoryPieceId is required" }, { status: 400 });
  }

  await deleteSubscriptionForUserAndMemoryPiece(auth.userId, memoryPieceId);
  return NextResponse.json({ success: true });
}
