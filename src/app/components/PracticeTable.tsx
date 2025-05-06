"use client"
import Link from "next/link";
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import Flipper from '@/app/components/Flipper'
import { CreateMemoryCheckInput } from '@/lib/db/model/types/MemoryCheck.types';
import { useState } from 'react';

const Checkbox = ({ checked, onChange }: { checked: boolean | null, onChange: () => void }) => (
  <label>
    <input 
      type="checkbox" 
      className="checkbox" 
      checked={checked === true}
      ref={input => {
        if (input) {
          input.indeterminate = checked === null;
        }
      }}
      onChange={onChange}
    />
  </label>
);

const TableCell = ({ content, id, checked, onChange }: { 
  content: string; 
  id: string;
  checked?: boolean | null;
  onChange?: () => void;
}) => {
  if (content === 'checkbox') {
    return <Flipper key={id} />
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

  headers.unshift('checkbox');
  data.forEach(row => row.unshift('checkbox'));

  const handleSelectAll = () => {
    if (Object.values(correctNess).filter(value => value).length === memoryPieceIds.length) {
      setCorrectNess(Object.keys(correctNess).reduce((res, curr) => {res[curr]=false; return res;}, {}));
    } else {
      setCorrectNess(Object.keys(correctNess).reduce((res, curr) => {res[curr]=true; return res;}, {}));
    }
  };

  const handleSelectOne = (id: string) => {
    const correctNessCopy = {...correctNess};
    if (correctNessCopy[id]) {
      correctNessCopy[id] = false;
    } else {
      correctNessCopy[id] = true;
    }
    setCorrectNess(correctNessCopy);
  };

  const getHeaderCheckboxState = () => {
    if (Object.keys(correctNess).filter(key => correctNess[key]).length === 0) return false;
    if (Object.keys(correctNess).filter(key => correctNess[key]).length === memoryPieceIds.length) return true;
    return null; // Indeterminate state
  };

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
              checked={header === 'checkbox' ? getHeaderCheckboxState() : undefined}
              onChange={header === 'checkbox' ? handleSelectAll : undefined}
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
              checked={correctNess[id]}
              onChange={() => handleSelectOne(id)}
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