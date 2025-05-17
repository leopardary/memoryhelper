import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import { getSubscriptionsDueToCheckForUser, processSubscriptions } from "@/lib/db/api/subscription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createMemoryCheckInBatch } from '@/lib/db/api/memory-check';
import PracticeTable from '@/app/components/PracticeTable';
import { redirect } from 'next/navigation';

const createMemoryChecks = async (memoryCheckResults: any) => {
  'use server'
  const memoryCheckInputs = Object.keys(memoryCheckResults).map(subscriptionId => {
    if (memoryCheckResults[subscriptionId] != null) {
      return {
        subscription: subscriptionId,
        score: memoryCheckResults[subscriptionId]
      };
    }
  }).filter(memoryCheck => memoryCheck != null);
  const createdMemoryChecks = await createMemoryCheckInBatch(memoryCheckInputs);
  const updatedSubscriptions = await processSubscriptions(Object.keys(memoryCheckResults));
  return {
    createdMemoryChecks, 
    updatedSubscriptions
  };
}

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Practice() {
  const session = await getServerSession(authOptions);
  const user = session.user;
  const subscriptionsDue = await getSubscriptionsDueToCheckForUser(user.id);
  const memoryPieceIdToSubscriptionId = {};
  subscriptionsDue.forEach(subscription => memoryPieceIdToSubscriptionId[subscription.memoryPieceId.toString()] = subscription._id.toString());
  const memoryPiecesToCheck = await findMemoryPiecesInBatch(subscriptionsDue.map(subscription => subscription.memoryPieceId.toString()));
  const refreshPage = async () => {
    'use server'
    redirect('/practice');
  }
  return (<div className="flex flex-col items-center">
        <PracticeTable memoryPiecesStr={JSON.stringify(memoryPiecesToCheck)} memoryPieceIdToSubscriptionId={memoryPieceIdToSubscriptionId} createMemoryChecks={createMemoryChecks} refreshPage={refreshPage} />
      </div>)
}
