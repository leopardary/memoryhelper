import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import MemoryPieceCard from "@/app/components/MemoryPieceCard"
import { getSubscriptionsForUser } from "@/lib/db/api/subscription"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { EmptyState } from "@/app/components/EmptyState";
import { BookOpenIcon } from "@heroicons/react/24/outline";

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Review() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const existingSubscriptions = (await getSubscriptionsForUser(user.id));
  const subscribedMemoryPieceIds = existingSubscriptions.map(existingSubscription => existingSubscription.memoryPieceId.toString());
  const subscribedMemoryPieces = await findMemoryPiecesInBatch(subscribedMemoryPieceIds);

  return (
    <div className="flex flex-col items-center">
      {subscribedMemoryPieces.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="No subscribed memory pieces yet"
          description="Start subscribing to memory pieces to build your personal learning collection. Browse subjects and units to find content you want to learn."
          action={{
            label: "Browse Subjects",
            href: "/"
          }}
        />
      ) : (
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subscribedMemoryPieces.map((memoryPiece: any) => (
            <MemoryPieceCard memoryPiece={memoryPiece} key={memoryPiece.id} />
          ))}
        </div>
      )}
    </div>
  )
}
