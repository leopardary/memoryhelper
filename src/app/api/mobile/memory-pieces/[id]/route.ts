import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getMemoryPiece } from "@/lib/db/api/memory-piece";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const mp = await getMemoryPiece(id);
  if (!mp) {
    return NextResponse.json({ error: "Memory piece not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: mp.id,
    content: mp.content,
    description: mp.description,
    labels: mp.labels,
    imageUrls: mp.imageUrls,
    units: mp.units?.map((u: any) => u.id || u.toString()),
  });
}
