import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { createMemoryCheck } from "@/lib/db/api/memory-check";
import { processSubscriptions } from "@/lib/db/api/subscription";

export async function POST(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { subscription, score } = await req.json();
  if (!subscription) {
    return NextResponse.json({ error: "subscription id is required" }, { status: 400 });
  }

  await createMemoryCheck({ subscription, score });
  await processSubscriptions([subscription]);

  return NextResponse.json({ success: true });
}
