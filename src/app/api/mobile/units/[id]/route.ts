import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getUnit } from "@/lib/db/api/unit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

  const children = (unit as any).children || [];
  const memoryPieces = (unit as any).memoryPieces || [];

  return NextResponse.json({
    _id: unit.id,
    title: unit.title,
    type: unit.type,
    description: unit.description,
    imageUrls: unit.imageUrls,
    parentUnit: unit.parentUnit?.toString() || null,
    subject: unit.subject?.toString(),
    order: unit.order,
    children: children.map((c: any) => ({
      _id: c.id,
      title: c.title,
      type: c.type,
      description: c.description,
      imageUrls: c.imageUrls,
      parentUnit: c.parentUnit?.toString() || null,
      subject: c.subject?.toString(),
      order: c.order,
    })),
    memoryPieces: memoryPieces.map((mp: any) => ({
      _id: mp.id,
      content: mp.content,
      description: mp.description,
      labels: mp.labels,
      imageUrls: mp.imageUrls,
    })),
  });
}
