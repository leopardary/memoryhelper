"use client"
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import { useState } from 'react';
import { Button } from '@/app/components/button';
import { MemoryCheckProps } from '@/app/components/utils';
import {HeroCard} from '@/app/components/HeroCard';

interface SelfCheckCardsProps {
  // The serialized string for MemoryPieces for test.
  memoryPiecesStr: string;
  memoryPieceIdToSubscriptionId: Record<string, string>;
  // Server function to create new MemoryCheck instance.
  createMemoryCheck: (memoryCheck: MemoryCheckProps) => Promise<boolean>;
  redirectPage: () => Promise<never>
}

export default function SelfCheckCards({ memoryPiecesStr, memoryPieceIdToSubscriptionId, createMemoryCheck, redirectPage}: SelfCheckCardsProps) {
  const limit = 15;
  const memoryPieceIds = JSON.parse(memoryPiecesStr).splice(0, limit);
  const [currentMemoryPieceIndex, setCurrentMemoryPieceIndex] = useState(0);
  const data = memoryPieceIds.map((memoryPiece: MemoryPieceProps) => {
    return {content: memoryPiece.content, description: memoryPiece.description, imageUrls: memoryPiece.imageUrls, labels: memoryPiece.labels, id: memoryPiece._id};
  });

  const currentMemoryPieceProps = currentMemoryPieceIndex < data.length && data?.[currentMemoryPieceIndex];
  const correctHandler = async () => {
    await createMemoryCheck({subscription: memoryPieceIdToSubscriptionId[currentMemoryPieceProps.id], score: true});
    if (currentMemoryPieceIndex < data.length) {
      setCurrentMemoryPieceIndex(currentMemoryPieceIndex + 1);
    }
  }

  const wrongHandler = async () => {
    await createMemoryCheck({subscription: memoryPieceIdToSubscriptionId[currentMemoryPieceProps.id], score: false});
    if (currentMemoryPieceIndex < data.length) {
      setCurrentMemoryPieceIndex(currentMemoryPieceIndex + 1);
    }
  }
  if (currentMemoryPieceProps) {
    return (
      <div className="w-full flex flex-col items-center">
        <h1 className="font-serif font-bold">{`${currentMemoryPieceIndex+1}/${memoryPieceIds.length}`}</h1>
        <HeroCard 
          imageSrcs={currentMemoryPieceProps.imageUrls} 
          imageAlt={currentMemoryPieceProps.content} 
          title={currentMemoryPieceProps.content} 
          description={currentMemoryPieceProps.description} 
          testMode={true} 
          correctHandler={correctHandler} 
          wrongHandler={wrongHandler}
        />
      </div>)
  } else if (currentMemoryPieceIndex >= data.length) {
    return (
      <div className="flex flex-col justify-center">
        <h1>Congrats! You have finished all self checks!</h1>
        <Button className="w-16 h-6" onClick={redirectPage}>Go to Performance</Button>
      </div>
    )
  }
}