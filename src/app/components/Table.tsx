import Link from "next/link";
import {MemoryPieceProps} from '@/lib/db/model/types/MemoryPiece.types'

const Checkbox = () => <label>
<input type="checkbox" className="checkbox" />
</label>

const TableCell = ({ content, key }: { content: string; key: string }) => {
  if (content === 'checkbox') {
    return <th key={key}><Checkbox /></th>
  } else {
    return <th key={key}>{content}</th>
  }
}

interface TableProps {
  memoryPieces: MemoryPieceProps[];
}

export default function Table({ memoryPieces }: TableProps) {
  const headers = ['checkbox', 'content', 'description', 'label'];
  const data = memoryPieces.map((memoryPiece: MemoryPieceProps) => {
       return ['checkbox', memoryPiece.content, memoryPiece.description?.split("##").join('  '), memoryPiece.labels, memoryPiece._id];
    });
  return <div className="w-full">
  <table className="table w-full">
    <thead>
      <tr>
        {headers.map((header: string) => <TableCell key={header} content={header} />)}
        <th className="w-24"></th>
      </tr>
    </thead>
    <tbody>
      {data && data.map((row, index) => {
        const checkbox = row[0];
        const id = row[row.length - 1];
        const contents = row.slice(1, row.length - 1);
        return <tr key={index} className="hover:bg-base-200">
          <TableCell key={index.toString()} content={checkbox} />
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