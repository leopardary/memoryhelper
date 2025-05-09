"use client"
import Link from "next/link";
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import { CreateMemoryCheckInput } from '@/lib/db/model/types/MemoryCheck.types';
import { useState } from 'react';

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

const TableCell = ({ content, id, onChange }: { 
  content: string; 
  id: string;
  checked?: boolean | null;
  onChange?: () => void;
}) => {
  if (content === 'checkbox') {
    return <th key={id}><Checkbox onChange={onChange} /></th>
  } else if (content == 'submitButton') {
    return <th key={'submit'}><button className='btn' onClick={() => {}}>Submit</button></th>
  } else {
    return <th key={id}>{content}</th>
  }
}

interface TableProps {
  memoryPiecesStr: string;
  createMemoryCheckInBatch: (memoryCheckIds: CreateMemoryCheckInput[]) => Promise<string[]>;
}

export default function Table({ memoryPiecesStr, createMemoryCheckInBatch }: TableProps) {
  const memoryPieceIds = JSON.parse(memoryPiecesStr);
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