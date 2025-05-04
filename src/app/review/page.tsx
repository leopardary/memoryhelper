import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import MemoryPieceCard from "@/app/components/MemoryPieceCard"
import { MemoryPiece } from "@lib/db/model/memoryPiece"
import { getSubscriptionsForUser } from "@/lib/db/api/subscription"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Review() {
  const session = await getServerSession(authOptions);
  const user = session.user;
  const existingSubscriptions = (await getSubscriptionsForUser(user.id));
  const subscribedMemoryPieceIds = existingSubscriptions.map(existingSubscription => existingSubscription.memoryPieceId.toString());
  const subscribedMemoryPieces = await findMemoryPiecesInBatch(subscribedMemoryPieceIds);
  return (<div className="flex flex-col items-center">
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(subscribedMemoryPieces).map((memoryPiece: MemoryPiece) => (
            <MemoryPieceCard memoryPiece={memoryPiece} key={memoryPiece.id} />
          ))}
        </div>
      </div>)
}
