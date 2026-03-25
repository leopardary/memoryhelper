import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { getSubject } from "@/lib/db/api/subject";
import { getDirectChildrenBySubject } from "@/lib/db/api/unit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const units = await getDirectChildrenBySubject(id);

  return NextResponse.json({
    subject: {
      _id: subject.id,
      title: subject.title,
      description: subject.description,
      labels: subject.labels,
      imageUrls: subject.imageUrls,
    },
    units: units.map(u => ({
      _id: u.id,
      title: u.title,
      type: u.type,
      description: u.description,
      imageUrls: u.imageUrls,
      parentUnit: u.parentUnit?.toString() || null,
      subject: u.subject.toString(),
      order: u.order,
    })),
  });
}
