import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { searchMemoryPieces } from "@/lib/db/api/memory-piece";

export async function GET(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const results = await searchMemoryPieces(query, limit);

  return NextResponse.json({
    results: results.map((mp: any) => ({
      _id: mp._id.toString(),
      content: mp.content,
      description: mp.description,
      labels: mp.labels,
      imageUrls: mp.imageUrls,
    })),
    total: results.length,
  });
}
