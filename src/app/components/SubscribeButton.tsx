"use client";
import { useTransition, useState, useCallback } from "react";
import { Button } from '@/app/components/button';
import Spinner from '@/app/components/Spinner';
import { ExclamationTriangleIcon, PlusCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface SubscribeButtonProps {
  memoryPieceIds: Record<string, boolean>;
  findOrCreateSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
  removeSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
}

export default function SubscribeButton({ memoryPieceIds, findOrCreateSubscriptionsInBatch, removeSubscriptionsInBatch }: SubscribeButtonProps) {
  // True if the subscribe action is triggered but not receiving the response yet.
  const [isPending, startTransition] = useTransition();
  // True if the server action for subscription is successfully finished.
  const [success, setSuccess] = useState(0);
  // True if the subscribe button is enabled.
  const [subscribeBtnEnabled, setSubscribeBtnEnabled] = useState(true);
  const handleSubscribe = useCallback(() => {
    setSuccess(0);
    setSubscribeBtnEnabled(false);
    startTransition(async () => {
      const selected = Object.keys(memoryPieceIds).filter(key => memoryPieceIds[key]);
      const unselected = Object.keys(memoryPieceIds).filter(key => !memoryPieceIds[key]);
      const successfulSubscriptions = await findOrCreateSubscriptionsInBatch(selected);
      const successfulDeletions = await removeSubscriptionsInBatch(unselected);
      if (successfulSubscriptions.length == selected.length && successfulDeletions.length == unselected.length) {
        setSuccess(1)
        setTimeout(() => setSubscribeBtnEnabled(true), 5000);
      } else {
        setSuccess(-1);
        setTimeout(() => setSubscribeBtnEnabled(true), 5000);
      }
    })
  }, [memoryPieceIds, findOrCreateSubscriptionsInBatch, removeSubscriptionsInBatch]);

  return (
    <div className="flex items-center gap-2">
    <Button onClick={handleSubscribe} disabled={!subscribeBtnEnabled}>{isPending ? <Spinner /> : subscribeBtnEnabled ? <PlusCircleIcon /> : success ? <CheckCircleIcon /> : <ExclamationTriangleIcon />}Subscribe</Button>
    </div>
  );
}
