import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import { getSubscriptionsDueToCheckForUser } from "@/lib/db/api/subscription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { createMemoryCheck } from '@/lib/db/api/memory-check';
import SelfCheckCards from '@/app/components/SelfCheckCards';
import { redirect } from 'next/navigation';

export default async function SelfCheck() {
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
  return (<div className="flex flex-col items-center">
        <SelfCheckCards memoryPiecesStr={JSON.stringify(memoryPiecesToCheck)} memoryPieceIdToSubscriptionId={memoryPieceIdToSubscriptionId} createMemoryCheck={createMemoryCheck} redirectPage={redirectPage} />
      </div>)
}
