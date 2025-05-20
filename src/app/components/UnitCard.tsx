import Link from "next/link";
import Image from "next/image";
import { UnitProps } from "@/lib/db/model/types/Unit.types";

export default function UnitCard({ unit }: { unit: UnitProps }) {
  const {id, type, title, description, imageUrls, order } = unit;
  return (
    <Link
      href={"/unit/" + id}
      className="card w-full bg-base-100 hover:shadow-xl transition-shadow"
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
      <div className="card-body">
        <h2 className="card-title">
          {title}
        </h2>
        <p>{description}</p>
      </div>
    </Link>
  );
}
