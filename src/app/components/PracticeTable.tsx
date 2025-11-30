"use client"
import Link from "next/link";
import pickBy from 'lodash/pickBy';
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import { useTransition, useState } from 'react';
import { Button } from '@/app/components/button';
import {Badge} from '@/app/components/Badge';
import {handleRead} from '@/app/components/utils';

const Checkbox = ({ onChange }: { onChange?: (value: boolean | null) => void }) => {
  const [isRight, setIsRight] = useState<boolean | null>(null);
  const finalOnChange = (isRightCheckBox: boolean) => {return () => {
    if (isRightCheckBox) {
      // uncheck right checkbox
      if (isRight) {
        setIsRight(null);
        onChange?.(null);
      } else {
        setIsRight(true);
        onChange?.(true);
      }
    } else {
      // uncheck wrong checkbox
      if (isRight === false) {
        setIsRight(null);
        onChange?.(null);
      } else {
        setIsRight(false);
        onChange?.(false);
      }
    }
  };}
  return (
  <div className='flex-nowrap'>
  <label className='my-2 mr-1 text-green-400 dark:text-green-600'>
    <input 
      type="checkbox" 
      className="checkbox m-1" 
      checked={isRight === true}
      onChange={finalOnChange(true)}
    />
    ✅
  </label>
  <label className='my-2 ml-1 text-red-400 dark:text-red-600'>
    <input 
      type="checkbox" 
      className="checkbox m-1" 
      checked={isRight === false}
      onChange={finalOnChange(false)}
    />
    ❌
  </label>
  </div>
  );};

interface SubmitButtonProps {
  correctNess?: Record<string, boolean>;
  memoryPieceIdToSubscriptionId?: Record<string, string>,
  createMemoryChecks?: (correctNess: Record<string, boolean>) => Promise<{createdMemoryChecks: string[], updatedSubscriptions: string[]}>;
  redirectPage?: () => Promise<void>;
}

const SubmitButton = (props: SubmitButtonProps) => {
  const correctNess = props.correctNess;
  const memoryPieceIdToSubscriptionId = props.memoryPieceIdToSubscriptionId;
  const createMemoryChecks = props.createMemoryChecks;
  const redirectPage = props.redirectPage;
  const driedCorrectNess = pickBy(correctNess, val => val != null);
  const subscriptionCorrectness: Record<string, boolean> = {};
  if (memoryPieceIdToSubscriptionId != null) {
    Object.keys(driedCorrectNess).forEach(memoryPieceId => subscriptionCorrectness[memoryPieceIdToSubscriptionId[memoryPieceId]] = driedCorrectNess[memoryPieceId]);
  }
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(0);
  if (createMemoryChecks == null)
    return <></>; 
  return (
    <>
    <Button className="w-16 h-8" onClick={() => {
      setSuccess(0);
      startTransition(async () => {
        const { createdMemoryChecks, updatedSubscriptions } = await createMemoryChecks(subscriptionCorrectness);
        if (createdMemoryChecks.length == Object.keys(subscriptionCorrectness).length && updatedSubscriptions.length == Object.keys(subscriptionCorrectness).length) {
          setSuccess(1);
          if (redirectPage != null) {
            await redirectPage();
          }
        } else {
          setSuccess(-1);
        }
      })
    }}>Submit</Button>
    {isPending && (
      <div className="inline-block ml-2">
        <div className="animate-spin h-5 w-5 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    )}
    {!isPending && success == 1 && (
      <span className='text-green-600 dark:text-green-400'>Submitted successfully.</span>
    )}
    {!isPending && success == -1 && (
      <span className='text-red-600 dark:text-red-400'>Submission failed.</span>
    )}
    </>
  );
}

const TableCell = ({ content, id, onChange, submitButtonProps, isHeader }: { 
  content: string; 
  id?: string;
  onChange?: (value: boolean | null) => void;
  submitButtonProps?: SubmitButtonProps;
  isHeader?: boolean;
}) => {
  if (content === 'checkbox') {
    return isHeader ? <th key={id} scope='col' className='px-6 py-3'><Checkbox onChange={onChange} /></th> : <td key={id} className='px-6 py-4'><Checkbox onChange={onChange} /></td>
  } else if (content == 'submitButton') {
    return <th key={'submit'}><SubmitButton correctNess={submitButtonProps?.correctNess} memoryPieceIdToSubscriptionId={submitButtonProps?.memoryPieceIdToSubscriptionId} createMemoryChecks={submitButtonProps?.createMemoryChecks} redirectPage={submitButtonProps?.redirectPage} /></th>
  } else {
    return isHeader ? <th key={id} scope='col' className='px-6 py-3'>{content}</th> : <td key={id} className='px-6 py-4'>{content}</td>
  }
}

interface TableProps {
  // The serialized string for MemoryPieces for test.
  memoryPiecesStr: string;
  // The according Subscription ids in the same order with memoryPiecesStr.
  memoryPieceIdToSubscriptionId: Record<string, string>;
  createMemoryChecks: (correctNess: Record<string, boolean>) => Promise<{createdMemoryChecks: string[], updatedSubscriptions: string[]}>;
  redirectPage: () => Promise<void>;
}

export default function PracticeTable({ memoryPiecesStr, memoryPieceIdToSubscriptionId, createMemoryChecks, redirectPage }: TableProps) {
  const memoryPieceIds = JSON.parse(memoryPiecesStr);
  // object to maintain the correctness for each memory piece, with key being the id for the memory piece, and value being the correctness.
  const [correctNess, setCorrectNess] = useState({});
  
  const headers = ['content', 'description', 'label'];
  const data = memoryPieceIds.map((memoryPiece: MemoryPieceProps) => {
    return {content: memoryPiece.content, description: memoryPiece.description?.split("##").join('  '), labels: memoryPiece.labels, id: memoryPiece._id};
  });

  headers.unshift('submitButton');
  data.forEach((memoryPiece: any) => memoryPiece.checkbox = true);

  const handleSelectOne = (memoryPieceId: string) => { return (value: boolean | null) => {
      const correctNessCopy: Record<string, boolean | null> = {...correctNess};
      if (correctNessCopy[memoryPieceId] === true) {
        if (value === true) {
          return;
        } else if (value === false) {
          correctNessCopy[memoryPieceId] = false;
        } else if (value === null) {
          correctNessCopy[memoryPieceId] = null;
        }
      } else if (correctNessCopy[memoryPieceId] === false) {
        if (value === true) {
          correctNessCopy[memoryPieceId] = true;
        } else if (value === false) {
          return;
        } else if (value === null) {
          correctNessCopy[memoryPieceId] = null;
        }
      } else if (correctNessCopy[memoryPieceId] == null) {
        if (value === true) {
          correctNessCopy[memoryPieceId] = true;
        } else if (value === false) {
          correctNessCopy[memoryPieceId] = false;
        } else if (value === null) {
          return;
        }
      }
      setCorrectNess(correctNessCopy);
    };
  }

  return (
  <>
  <div className="mt-2 relative overflow-x-auto shadow-md sm:rounded-lg border-2">
    <table className="w-full text-sm text-center rtl:text-right">
      <thead className="text-xs uppercase bg-muted">
        <tr className="border-b">
          {headers.map((header: string) => (
            <TableCell 
              key={header} 
              content={header}
              submitButtonProps={{correctNess, memoryPieceIdToSubscriptionId, createMemoryChecks, redirectPage}}
              isHeader={true}
            />
          ))}
          <th className="w-24"></th>
        </tr>
      </thead>
      <tbody>
        {data && data.map((memoryPiece: any, index: number) => {
          const checkbox = memoryPiece.checkbox ? 'checkbox' : '';
          const id = memoryPiece.id;
          return <tr key={index} className="hover:bg-base-200 border-b">
            <TableCell 
              id={id} 
              content={checkbox} 
              onChange={handleSelectOne(id)}
            />
            <td key='content' className='px-6 py-3'>{memoryPiece.content}</td>
            <td key='description' className='px-6 py-3'>{memoryPiece.description}<Button className='h-8 w-16' onClick={() => handleRead(memoryPiece.description?.split('##')[0].split('/')[0])}>Read</Button></td>
            <td key='labels' className='px-6 py-3'>{memoryPiece.labels.map((label:string) => <Badge key={label} variant="outline">{label}</Badge>)}</td>
            <td className="w-24">
              <Button className='h-8 w-16'>
                              <Link
                                href={`/memorypiece/${id}`}
                                >
                                Details
                              </Link>
                            </Button>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
  </> 
  )
}