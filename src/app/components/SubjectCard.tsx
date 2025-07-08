import Link from "next/link";
import Image from "next/image";
import { SubjectProps } from "@/lib/db/model/types/Subject.types";
import {Badge} from '@/app/components/Badge'

export default function SubjectCard({ subject }: { subject: SubjectProps }) {
  const { _id, title, description, imageUrls, labels } = subject;
  return (
    <Link
      href={"/subject/" + _id}
      className="w-full m-2 bg-background hover:shadow-xl transition-shadow rounded-md md:rounded-lg hover:border-2"
    >
      <div className="m-4">
        <figure>
          <Image
            src={imageUrls?.[0] || ''}
            alt={title}
            width={400}
            height={400}
            className="h-48 object-contain"
          />
        </figure>
      </div>
      <div className="mx-4 flex flex-col items-center">
        {/* <h2 className="m-3 font-serif text-lg">
          {title}
        </h2> */}
        {labels != undefined && labels.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
          {labels.map((label) => (
            <Badge key={label} variant="outline">{label}</Badge>
          ))}
        </div>}
        <p className="my-2 font-serif text-sm italic text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
