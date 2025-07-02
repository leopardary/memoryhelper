import Link from "next/link";
import { Button } from '@/app/components/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationBar({
  currentPage,
  totalPages,
}: PaginationBarProps) {
  const maxPage = Math.min(totalPages, Math.max(currentPage + 4, 10));
  const minPage = Math.max(1, Math.min(currentPage - 5, maxPage - 9));
  const numberedPageItems: React.ReactElement[] = [];
  for (let page = minPage; page <= maxPage; page++) {
    numberedPageItems.push(
      <Link
        href={`?page=${page}`}
        key={page}
        className={`relative z-10 inline-flex items-center border border-border rounded-sm bg-background px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border ${currentPage === page ? "pointer-events-none text-muted" : "text-primary "}`}
      >
        {page}
      </Link>,
    );
  }
  return (
    <div className="w-full">
          <nav aria-label="Pagination" className="w-full isolate inline-flex -space-x-px rounded-md shadow-xs place-content-center">
      <div className="hidden sm:block">{numberedPageItems}</div>
      <div className="flex flex-1 justify-between sm:hidden">
        {(
          <Link href={"?page=" + (currentPage - 1)} className={`relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent ${currentPage === 1 ? "pointer-events-none text-muted" : "text-primary"}`}>
            Previous
          </Link>
        )}
        {(
          <Link href={"?page=" + (currentPage + 1)} className={`relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent ${currentPage === totalPages ? "pointer-events-none text-muted" : "text-primary"}`}>
            Next
          </Link>
        )}
      </div>
    </nav>
        </div>
  );
}
