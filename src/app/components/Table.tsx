"use client"
import Link from "next/link";
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import SubscribeButton from '@/app/components/SubscribeButton'
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
  subscriptions: Record<string, boolean>;
  loggedIn: boolean;
  findOrCreateSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
  removeSubscriptionsInBatch: (memoryPieceIds: string[]) => Promise<string[]>;
}

export default function Table({ memoryPiecesStr, subscriptions, loggedIn, findOrCreateSubscriptionsInBatch, removeSubscriptionsInBatch }: TableProps) {
  const memoryPieceIds = JSON.parse(memoryPiecesStr);
  const [selected, setSelected] = useState(subscriptions);
  
  const headers = ['content', 'description', 'label'];
  const data = memoryPieceIds.map((memoryPiece: MemoryPieceProps) => {
    return [memoryPiece.content, memoryPiece.description?.split("##").join('  '), memoryPiece.labels, memoryPiece._id];
  });

  if (loggedIn) {
    headers.unshift('checkbox');
    data.forEach(row => row.unshift('checkbox'));
  }

  const handleSelectAll = () => {
    if (Object.values(selected).filter(value => value).length === memoryPieceIds.length) {
      setSelected(Object.keys(selected).reduce((res, curr) => {res[curr]=false; return res;}, {}));
    } else {
      setSelected(Object.keys(selected).reduce((res, curr) => {res[curr]=true; return res;}, {}));
    }
  };

  const handleSelectOne = (id: string) => {
    const selectedCopy = {...selected};
    if (selectedCopy[id]) {
      selectedCopy[id] = false;
    } else {
      selectedCopy[id] = true;
    }
    setSelected(selectedCopy);
  };

  const getHeaderCheckboxState = () => {
    if (Object.keys(selected).filter(key => selected[key]).length === 0) return false;
    if (Object.keys(selected).filter(key => selected[key]).length === memoryPieceIds.length) return true;
    return null; // Indeterminate state
  };

  return (
  <>
  {loggedIn && <SubscribeButton memoryPieceIds={selected} findOrCreateSubscriptionsInBatch={findOrCreateSubscriptionsInBatch} removeSubscriptionsInBatch={removeSubscriptionsInBatch} />}
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
              checked={selected[id]}
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