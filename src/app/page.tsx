import SubjectCard from "@/app/components/SubjectCard";
import PaginationBar from "@/app/components/PaginationBar";
import {getSubjectCount, getSubjectsWithPagination} from "@/lib/db/api/subject";
import {HeroCard} from '@/app/components/HeroCard';

export default async function Home(props: {
  searchParams: Promise<{
    page: string;
  }>
}) {
  const page = (await props.searchParams)?.page || '1';
  const currentPage = parseInt(page);
  const pageSize = 3;
  const heroItemCount = 1;
  const totalItemCount = await getSubjectCount();
  const totalPages = Math.ceil((totalItemCount - heroItemCount) / pageSize);

  const subjects = await getSubjectsWithPagination(currentPage, pageSize, heroItemCount);
  return (
    <div className="flex flex-col items-center">
      {currentPage === 1 && subjects.length > 0 && (<HeroCard imageSrcs={subjects[0].imageUrls} imageAlt={subjects[0].title} title={subjects[0].title} description={subjects[0].description} href={"/subject/" + subjects[0].id} buttonContent={"Check it out"} />)}

      <div className="w-full my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
