import MemoryPieceCard from "@/app/components/MemoryPieceCard";
import Link from "next/link";
import { prisma } from "@/lib/db/api/prisma";
import Image from "next/image";
import PaginationBar from "@/app/components/PaginationBar";

interface HomeProps {
  searchParams: {
    page: string;
  };
}

export default async function Home({
  searchParams: { page = "1" },
}: HomeProps) {
  const currentPage = parseInt(page);
  const pageSize = 3;
  const heroItemCount = 1;
  const totalItemCount = await prisma.memoryPiece.count();
  const totalPages = Math.ceil((totalItemCount - heroItemCount) / pageSize);

  const memoryPieces = await prisma.memoryPiece.findMany({
    orderBy: { id: "desc" },
    skip:
      (currentPage - 1) * pageSize + (currentPage === 1 ? 0 : heroItemCount),
    take: pageSize + (currentPage === 1 ? heroItemCount : 0),
  });
  return (
    <div className="flex flex-col items-center">
      {currentPage === 1 && (
        <div className="hero rounded-xl bg-base-200">
          <div className="hero-content flex-col lg:flex-row">
            <Image
              src={memoryPieces[0].imageUrl}
              alt={memoryPieces[0].content}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-2xl"
              priority
            />
            <div>
              <h1 className="text-5xl font-bold">{memoryPieces[0].content}</h1>
              <p className="py-6">{memoryPieces[0].description}</p>
              <Link
                href={"/memorypiece/" + memoryPieces[0].id}
                className="btn-primary btn"
              >
                Check it out
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(currentPage === 1 ? memoryPieces.slice(1) : memoryPieces).map((memoryPiece) => (
          <MemoryPieceCard memoryPiece={memoryPiece} key={memoryPiece.id} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
