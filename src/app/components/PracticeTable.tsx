"use client"
import Link from "next/link";
import pickBy from 'lodash/pickBy';
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import { useTransition, useState } from 'react';

const Checkbox = ({ onChange }: { onChange: (value: boolean | null) => void }) => {
  const [isRight, setIsRight] = useState<boolean | null>(null);
  const finalOnChange = (isRightCheckBox: boolean) => {return () => {
    if (isRightCheckBox) {
      // uncheck right checkbox
      if (isRight) {
        setIsRight(null);
        onChange(null);
      } else {
        setIsRight(true);
        onChange(true);
      }
    } else {
      // uncheck wrong checkbox
      if (isRight === false) {
        setIsRight(null);
        onChange(null);
      } else {
        setIsRight(false);
        onChange(false);
      }
    }
  };}
  return (
  <>
  <label className='m-2 text-green-500'>
    <input 
      type="checkbox" 
      className="checkbox m-1" 
      checked={isRight === true}
      onChange={finalOnChange(true)}
    />
    Right
  </label>
  <label className='m-2 text-red-500'>
    <input 
      type="checkbox" 
      className="checkbox m-1" 
      checked={isRight === false}
      onChange={finalOnChange(false)}
    />
    Wrong
  </label>
  </>
);};

interface SubmitButtonProps {
  correctNess: Record<string, boolean>;
  createMemoryChecks: (correctNess: Record<string, boolean>) => Promise<string[]>;
  refreshPage: () => Promise<void>;
}

const SubmitButton = (props: SubmitButtonProps) => {
  const correctNess = props.correctNess;
  const createMemoryChecks = props.createMemoryChecks;
  const refreshPage = props.refreshPage;
  const driedCorrectNess = pickBy(correctNess, val => val != null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(0);
  return (
    <>
    <button className='btn' onClick={() => {
      setSuccess(0);
      startTransition(async () => {
        const successfulSubmission = await createMemoryChecks(driedCorrectNess);
        if (successfulSubmission.length == Object.keys(driedCorrectNess).length) {
          setSuccess(1);
          await refreshPage();
        } else {
          setSuccess(-1);
        }
      })
    }}>Submit</button>
    {isPending && <span className="loading loading-spinner loading-md" />}
    {!isPending && success == 1 && (
      <span className='text-success'>Submitted successfully.</span>
    )}
    {!isPending && success == -1 && (
      <span className='text-warning'>Submission failed.</span>
    )}
    </>
  );
}

const TableCell = ({ content, id, onChange, submitButtonProps }: { 
  content: string; 
  id: string;
  onChange?: () => void;
  submitButtonProps: SubmitButtonProps
}) => {
  if (content === 'checkbox') {
    return <th key={id}><Checkbox onChange={onChange} /></th>
  } else if (content == 'submitButton') {
    return <th key={'submit'}><SubmitButton correctNess={submitButtonProps.correctNess} createMemoryChecks={submitButtonProps.createMemoryChecks} refreshPage={submitButtonProps.refreshPage} /></th>
  } else {
    return <th key={id}>{content}</th>
  }
}

interface TableProps {
  memoryPiecesStr: string;
  createMemoryChecks: (correctNess: any) => Promise<string[]>;
  refreshPage: () => Promise<void>;
}

export default function PracticeTable({ memoryPiecesStr, createMemoryChecks, refreshPage }: TableProps) {
  const memoryPieceIds = JSON.parse(memoryPiecesStr);
  // object to maintain the correctness for each memory piece, with key being the id for the memory piece, and value being the correctness.
  const [correctNess, setCorrectNess] = useState({});
  
  const headers = ['content', 'description', 'label'];
  const data = memoryPieceIds.map((memoryPiece: MemoryPieceProps) => {
    return [memoryPiece.content, memoryPiece.description?.split("##").join('  '), memoryPiece.labels, memoryPiece._id];
  });

  headers.unshift('submitButton');
  data.forEach(row => row.unshift('checkbox'));

  const handleSelectOne = (id: string) => { return (value: boolean) => {
      const correctNessCopy = {...correctNess};
      if (correctNessCopy[id] === true) {
        if (value === true) {
          return;
        } else if (value === false) {
          correctNessCopy[id] = false;
        } else if (value === null) {
          correctNessCopy[id] = null;
        }
      } else if (correctNessCopy[id] === false) {
        if (value === true) {
          correctNessCopy[id] = true;
        } else if (value === false) {
          return;
        } else if (value === null) {
          correctNessCopy[id] = null;
        }
      } else if (correctNessCopy[id] == null) {
        if (value === true) {
          correctNessCopy[id] = true;
        } else if (value === false) {
          correctNessCopy[id] = false;
        } else if (value === null) {
          return;
        }
      }
      setCorrectNess(correctNessCopy);
    };
  }

  return (
  <>
  <div className="w-full">
    <table className="table w-full">
      <thead>
        <tr>
          {headers.map((header: string) => (
            <TableCell 
              key={header} 
              content={header}
              submitButtonProps={{correctNess, createMemoryChecks, refreshPage}}
            />
          ))}
          <th className="w-24"></th>
        </tr>
      </thead>
      <tbody>
        {data && data.map((row, index) => {
          const checkbox = row[0];
          const id = row[row.length - 1];
          const contents = row.slice(1, row.length - 1);
          return <tr key={index} className="hover:bg-base-200">
            <TableCell 
              id={id} 
              content={checkbox} 
              onChange={handleSelectOne(id)}
            />
            {contents.map((elem, i) => <td key={i}>{elem}</td>)}
            <td className="w-24">
              <Link
                href={`/memorypiece/${id}`}
                className="btn btn-info btn-sm"
              >
                Details
              </Link>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
  </> 
  )
}