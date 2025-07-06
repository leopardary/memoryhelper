import Link from "next/link";
import Image from "next/image";
import { UnitProps } from "@/lib/db/model/types/Unit.types";

export default function UnitCard({ unit }: { unit: UnitProps }) {
  const {_id, title, description, imageUrls } = unit;
  return (
    <Link
      href={"/unit/" + _id?.toString()}
      className="w-full bg-background border-2 border-background hover:border-border hover:shadow-md transition-shadow rounded-md"
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
      <div className="mb-2 flex flex-col place-items-center">
        <h2 className="text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        {/* <p className="text-muted-foreground">{description}</p> */}
      </div>
    </Link>
  );
}
