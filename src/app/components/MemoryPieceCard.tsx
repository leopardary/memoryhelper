import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import Link from "next/link";
import Image from "next/image";

export default function MemoryPieceCard({ memoryPiece }: {memoryPiece: MemoryPieceProps}) {
  const { _id, description, content, labels, imageUrls } = memoryPiece;
  return (
    <Link
      href={"/memorypiece/" + _id?.toString()}
      className="card w-full bg-base-100 hover:shadow-xl transition-shadow"
    >
      <div className="m-4">
        <figure>
          <Image
            src={imageUrls?.[0] || ''}
            alt={content}
            width={400}
            height={400}
            className="h-48 object-contain"
          />
        </figure>
      </div>
      <div className="card-body">
        <h2 className="card-title">
          {content}
        </h2>
        <p>{description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {labels && labels.map((label, index) => (
            <div key={index} className="badge badge-outline">{label}</div>
          ))}
        </div>
      </div>
    </Link>
  );
}
