"use client";
import { Session } from "next-auth";
import { useTransition, useState } from "react";

interface SubscribeButtonProps {
  session: Session | null;
  memoryPieceIds: string[];
  findOrCreateSubscriptionsInBatch: (subscriptions: {userId: string, memoryPieceId: string}[]) => Promise<[any]>
}

export default function SubscribeButton({ session, memoryPieceIds, findOrCreateSubscriptionsInBatch }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(0);
  const user = session?.user;
  const subscriptions = memoryPieceIds.map((memoryPieceId: string) => {
    return {userId: user?._id, memoryPieceId: memoryPieceId};}
  )
  return (
    <div className="flex items-center gap-2">
    <button className='btn' onClick={() => {
      setSuccess(0);
      startTransition(async () => {
        const successfulSubscriptions = await findOrCreateSubscriptionsInBatch(subscriptions);
        if (successfulSubscriptions.length == subscriptions.length) {
          setSuccess(1)
        } else {
          setSuccess(-1);
        }
      })
    }}>Subscribe</button>
    {isPending && <span className="loading loading-spinner loading-md" />}
    {!isPending && success == 1 && (
      <span className='text-success'>Subscribed successfully.</span>
    )}
    {!isPending && success == -1 && (
      <span className='text-warning'>Subscription failed.</span>
    )}
    </div>
  );
}
