import SubjectCard from "@/app/components/SubjectCard";
import Link from "next/link";
import Image from "next/image";
import PaginationBar from "@/app/components/PaginationBar";
import {getSubjectCount, getSubjectsWithPagination} from "@/lib/db/api/subject";

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
  const totalItemCount = await getSubjectCount();
  const totalPages = Math.ceil((totalItemCount - heroItemCount) / pageSize);

  const subjects = await getSubjectsWithPagination(currentPage, pageSize, heroItemCount);
  return (
    <div className="flex flex-col items-center">
      {currentPage === 1 && (
        <div className="hero rounded-xl bg-base-200">
          <div className="hero-content flex-col lg:flex-row">
            <Image
              src={subjects[0].imageUrl || ""}
              alt={subjects[0].title}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-2xl"
              priority
            />
            <div>
              <h1 className="text-5xl font-bold">{subjects[0].title}</h1>
              <p className="py-6">{subjects[0].description}</p>
              <Link
                href={"/subject/" + subjects[0].id}
                className="btn-primary btn"
              >
                Check it out
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(currentPage === 1 ? subjects.slice(1) : subjects).map((subject) => (
          <SubjectCard subject={subject} key={subject.id} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
