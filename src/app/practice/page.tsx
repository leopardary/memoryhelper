import { findMemoryPiecesInBatch } from "@/lib/db/api/memory-piece";
import { getSubscriptionsForUser } from "@/lib/db/api/subscription";
import { memoryPieceToPracticeToday } from '@/lib/db/api/memory-piece';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createMemoryCheckInBatch } from '@/lib/db/api/memory-check';
import PracticeTable from '@/app/components/PracticeTable';
import { redirect } from 'next/navigation';

const createMemoryChecks = async (memoryCheckResults: any) => {
  'use server'
  const session = await getServerSession(authOptions);
  const user = session.user;
  const memoryCheckInputs = Object.keys(memoryCheckResults).map(memoryPieceId => {
    const correctness = memoryCheckResults[memoryPieceId];
    if (correctness != null) {
      return {
        memoryPiece: memoryPieceId,
        user: user.id,
        correctness: memoryCheckResults[memoryPieceId]
      };
    }
  }).filter(memoryCheck => memoryCheck != null);
  const createResult = await createMemoryCheckInBatch(memoryCheckInputs);
  return createResult;
}

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Practice() {
  const session = await getServerSession(authOptions);
  const user = session.user;
  const memoryPiecesToCheck = (await memoryPieceToPracticeToday(user.id));
  const refreshPage = async () => {
    'use server'
    redirect('/practice');
  }
  return (<div className="flex flex-col items-center">
        <PracticeTable memoryPiecesStr={JSON.stringify(memoryPiecesToCheck)} createMemoryChecks={createMemoryChecks} refreshPage={refreshPage} />
      </div>)
}
