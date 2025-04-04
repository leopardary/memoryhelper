import Link from "next/link";
import Image from "next/image";
import { SubjectProps } from "@/lib/db/model/types/Subject.types";

export default function SubjectCard({ subject }: { subject: SubjectProps }) {
  const { _id, title, description, imageUrl, labels } = subject;
  return (
    <Link
      href={"/subjects/" + _id}
      className="card w-full bg-base-100 hover:shadow-xl transition-shadow"
    >
      <div className="m-4">
        <figure>
          <Image
            src={imageUrl || ''}
            alt={title}
            width={400}
            height={400}
            className="h-48 object-contain"
          />
        </figure>
      </div>
      <div className="card-body">
        <h2 className="card-title">
          {title}
        </h2>
        <p>{description}</p>
        {labels != undefined && labels.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
          {labels.map((label, index) => (
            <div key={index} className="badge badge-outline">{label}</div>
          ))}
        </div>}
      </div>
    </Link>
  );
}
