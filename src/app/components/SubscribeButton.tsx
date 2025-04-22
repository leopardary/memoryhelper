"use client";
import { Session } from "next-auth";
import { useTransition, useState } from "react";

interface SubscribeButtonProps {
  session: Session | null;
  memoryPieceIds: string[];
  findOrCreateSubscriptionsInBatch: (subscriptions: {userId: string, memoryPieceId: string}[]) => Promise<void>
}

export default function SubscribeButton({ session, memoryPieceIds, findOrCreateSubscriptionsInBatch }: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const user = session?.user;
  const subscriptions = memoryPieceIds.map((memoryPieceId: string) => {
    return {userId: user?._id, memoryPieceId: memoryPieceId};}
  )
  // const handleClick = async ()=> await findOrCreateSubscriptionsInBatch(subscriptions)
  return (
    <div className="flex items-center gap-2">
    <button className='btn' onClick={() => {
      setSuccess(false);
      startTransition(async () => {
        await findOrCreateSubscriptionsInBatch(subscriptions);
        setSuccess(true)
      })
    }}>Subscribe</button>
    {isPending && <span className="loading loading-spinner loading-md" />}
    {!isPending && success && (
      <span className='text-success'>Subscribed successfully.</span>
    )}
    </div>
  );
}
