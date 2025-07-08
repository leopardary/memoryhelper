import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types';
import Link from "next/link";
import Image from "next/image";
import {Badge} from '@/app/components/Badge';

export default function MemoryPieceCard({ memoryPiece }: {memoryPiece: MemoryPieceProps}) {
  const { _id, description, content, labels, imageUrls } = memoryPiece;
  const [wordCombinations, sentenceSamples] = description == null ? ['', ''] : description?.split('##');

  return (
    <Link
      href={"/memorypiece/" + _id?.toString()}
      className="w-full rounded-lg hover:border-2 bg-base-100 hover:shadow-xl transition-shadow"
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
      <div className="flex flex-col items-center">
        <h2 className="m-2 text-bold">
          {content}
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {labels && labels.map((label, index) => (
            <Badge key={index} variant="outline">{label}</Badge> 
          ))}
        </div>
        <p className="m-2">{`词语: ${wordCombinations}`}</p>
        <p className="m-2">{`例句: ${sentenceSamples}`}</p>
      </div>
    </Link>
  );
}
