"use client";
import { useTransition, useState } from "react";

interface SubscribeButtonProps {
  memoryPieceIds: Record<string, boolean>;
  findOrCreateSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
  removeSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
}

export default function SubscribeButton({ memoryPieceIds, findOrCreateSubscriptionsInBatch, removeSubscriptionsInBatch }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(0);
  return (
    <div className="flex items-center gap-2">
    <button className='btn' onClick={() => {
      setSuccess(0);
      startTransition(async () => {
        const selected = Object.keys(memoryPieceIds).filter(key => memoryPieceIds[key]);
        const unselected = Object.keys(memoryPieceIds).filter(key => !memoryPieceIds[key]);
        const successfulSubscriptions = await findOrCreateSubscriptionsInBatch(selected);
        const successfulDeletions = await removeSubscriptionsInBatch(unselected);
        if (successfulSubscriptions.length == selected.length && successfulDeletions.length == unselected.length) {
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
