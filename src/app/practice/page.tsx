import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import MemoryPieceCard from "@/app/components/MemoryPieceCard"
import { MemoryPiece } from "@lib/db/model/memoryPiece"
import { getSubscriptionsForUser } from "@/lib/db/api/subscription"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createMemoryCheckInBatch } from '@/lib/db/api/memory-check';
import PracticeTable from '@/app/components/PracticeTable';

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Practice() {
  const session = await getServerSession(authOptions);
  const user = session.user;
  const existingSubscriptions = (await getSubscriptionsForUser(user.id));
  const subscribedMemoryPieceIds = existingSubscriptions.map(existingSubscription => existingSubscription.memoryPieceId.toString());
  const subscribedMemoryPieces = await findMemoryPiecesInBatch(subscribedMemoryPieceIds);
  return (<div className="flex flex-col items-center">
        <PracticeTable memoryPiecesStr={JSON.stringify(subscribedMemoryPieces)} createMemoryCheckInBatch={createMemoryCheckInBatch} />
      </div>)
}
