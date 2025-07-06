"use client"
import Link from "next/link";
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import SubscribeButton from '@/app/components/SubscribeButton'
import { Button } from '@/app/components/button'
import { useState } from 'react';
import Badge from '@/app/components/Badge';

const Checkbox = ({ checked, onChange }: { checked?: boolean, onChange?: () => void }) => (
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

const TableCell = ({ content, id, checked, onChange, isHeader }: { 
  content: string; 
  id?: string;
  checked?: boolean;
  onChange?: () => void;
  isHeader?: boolean;
}) => {
  if (content === 'checkbox') {
    return isHeader ? <th key={id} scope='col' className='px-6 py-3'><Checkbox checked={checked} onChange={onChange} /></th> : <td key={id} className='px-6 py-4'><Checkbox checked={checked} onChange={onChange} /></td>
  } else {
    return isHeader ? <th key={id} scope='col' className='px-6 py-3'>{content}</th> : <td key={id} className='px-6 py-4'>{content}</td>
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
    return {content: memoryPiece.content, description: memoryPiece.description?.split("##").join('  '), labels: memoryPiece.labels, id: memoryPiece._id};
  });

  if (loggedIn) {
    headers.unshift('checkbox');
    data.forEach((memoryPiece: any) => memoryPiece.checkbox = true);
  }

  const handleSelectAll = () => {
    if (Object.values(selected).filter(value => value).length === memoryPieceIds.length) {
      setSelected(Object.keys(selected).reduce((res: Record<string, boolean>, curr: string) => {res[curr]=false; return res;}, {}));
    } else {
      setSelected(Object.keys(selected).reduce((res: Record<string, boolean>, curr: string) => {res[curr]=true; return res;}, {}));
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
    return undefined; // Indeterminate state
  };

  return (
  <>
  {loggedIn && <SubscribeButton memoryPieceIds={selected} findOrCreateSubscriptionsInBatch={findOrCreateSubscriptionsInBatch} removeSubscriptionsInBatch={removeSubscriptionsInBatch} />}
  <div className="mt-2 relative overflow-x-auto shadow-md sm:rounded-lg border-2">
    <table className="w-full text-sm text-center rtl:text-right">
      <thead className="text-xs uppercase bg-muted">
        <tr className="border-b">
          {headers.map((header: string) => (
            <TableCell 
              key={header} 
              content={header} 
              checked={header === 'checkbox' ? getHeaderCheckboxState() : undefined}
              onChange={header === 'checkbox' ? handleSelectAll : undefined}
              isHeader={true}
            />
          ))}
          {/* column for Details buttons */}
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
              checked={selected[id]}
              onChange={() => handleSelectOne(id)}
            />
            <td key="content" className='px-6 py-3 font-bold'>{memoryPiece.content}</td>
            <td key="description" className='px-6 py-3'>{memoryPiece.description}</td>
            <td key="labels" className='px-6 py-3'>{memoryPiece.labels.map((label:string) => <Badge key={label} text={label}/>)}</td>
            <td className="w-24">
              <Button>
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