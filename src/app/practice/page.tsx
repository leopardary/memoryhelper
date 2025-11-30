import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import { getSubscriptionsDueToCheckForUser, processSubscriptions } from "@/lib/db/api/subscription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { createMemoryCheckInBatch } from '@/lib/db/api/memory-check';
import PracticeTable from '@/app/components/PracticeTable';
import { redirect } from 'next/navigation';
import { EmptyState } from "@/app/components/EmptyState";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

const createMemoryChecks = async (memoryCheckResults: Record<string, boolean>) => {
  'use server'
  const createdMemoryChecks = await createMemoryCheckInBatch(Object.keys(memoryCheckResults).map(subscription => {return {subscription: subscription, score:memoryCheckResults[subscription]};}));
  const updatedSubscriptions = await processSubscriptions(Object.keys(memoryCheckResults));
  return {
    createdMemoryChecks, 
    updatedSubscriptions
  };
}

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Practice() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const subscriptionsDue = await getSubscriptionsDueToCheckForUser(user.id);
  const memoryPieceIdToSubscriptionId: Record<string, string> = {};
  subscriptionsDue.forEach(subscription => memoryPieceIdToSubscriptionId[subscription.memoryPieceId.toString()] = subscription._id.toString());
  const memoryPiecesToCheck = await findMemoryPiecesInBatch(subscriptionsDue.map(subscription => subscription.memoryPieceId.toString()));
  const redirectPage = async () => {
    'use server'
    redirect('/performance');
  }

  return (
    <div className="flex flex-col items-center">
      {memoryPiecesToCheck.length === 0 ? (
        <EmptyState
          icon={AcademicCapIcon}
          title="No items due for practice"
          description="Great work! You're all caught up with your spaced repetition practice. Check back later or review your subscribed items."
          action={{
            label: "View All Subscriptions",
            href: "/review"
          }}
        />
      ) : (
        <PracticeTable
          memoryPiecesStr={JSON.stringify(memoryPiecesToCheck)}
          memoryPieceIdToSubscriptionId={memoryPieceIdToSubscriptionId}
          createMemoryChecks={createMemoryChecks}
          redirectPage={redirectPage}
        />
      )}
    </div>
  )
}
