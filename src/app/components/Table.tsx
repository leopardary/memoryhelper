"use client"
import Link from "next/link";
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
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
    return <th key={id}><Checkbox checked={checked} onChange={onChange} /></th>
  } else {
    return <th key={id}>{content}</th>
  }
}

interface TableProps {
  memoryPiecesStr: string;
}

export default function Table({ memoryPiecesStr }: TableProps) {
  const memoryPieces = JSON.parse(memoryPiecesStr);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  const headers = ['checkbox', 'content', 'description', 'label'];
  const data = memoryPieces.map((memoryPiece: MemoryPieceProps) => {
    return ['checkbox', memoryPiece.content, memoryPiece.description?.split("##").join('  '), memoryPiece.labels, memoryPiece._id];
  });

  const handleSelectAll = () => {
    if (selected.size === memoryPieces.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(memoryPieces.map(mp => mp._id.toString())));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const getHeaderCheckboxState = () => {
    if (selected.size === 0) return false;
    if (selected.size === memoryPieces.length) return true;
    return null; // Indeterminate state
  };

  return <div className="w-full">
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
              checked={selected.has(id.toString())}
              onChange={() => handleSelectOne(id.toString())}
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
}