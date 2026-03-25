import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getSubjectsWithPagination, getSubjectCount } from "@/lib/db/api/subject";

export async function GET(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const total = await getSubjectCount();
  const subjects = await getSubjectsWithPagination(page, limit, 0);

  return NextResponse.json({
    subjects: subjects.map(s => ({
      _id: s.id,
      title: s.title,
      description: s.description,
      labels: s.labels,
      imageUrls: s.imageUrls,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    total,
    page,
    limit,
  });
}
