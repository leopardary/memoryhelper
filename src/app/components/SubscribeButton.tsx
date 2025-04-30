"use client";
import { useTransition, useState } from "react";

interface SubscribeButtonProps {
  memoryPieceIds: string[];
  findOrCreateSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<[any]>
}

export default function SubscribeButton({ memoryPieceIds, findOrCreateSubscriptionsInBatch }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(0);
  return (
    <div className="flex items-center gap-2">
    <button className='btn' onClick={() => {
      setSuccess(0);
      startTransition(async () => {
        const successfulSubscriptions = await findOrCreateSubscriptionsInBatch(memoryPieceIds);
        if (successfulSubscriptions.length == memoryPieceIds.length) {
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
