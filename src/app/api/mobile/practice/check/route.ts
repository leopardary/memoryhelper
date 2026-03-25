import { NextResponse } from "next/server";
import { authenticateMobile, isAuthError } from "@/lib/utils/mobileAuth";
import { createMemoryCheckInBatch } from "@/lib/db/api/memory-check";
import { processSubscriptions } from "@/lib/db/api/subscription";

export async function POST(req: Request) {
  const auth = await authenticateMobile(req);
  if (isAuthError(auth)) return auth;

  const { checks } = await req.json();
  if (!checks || !Array.isArray(checks)) {
    return NextResponse.json({ error: "checks array is required" }, { status: 400 });
  }

  const createdMemoryChecks = await createMemoryCheckInBatch(
    checks.map((c: { subscription: string; score: boolean }) => ({
      subscription: c.subscription,
      score: c.score,
    }))
  );

  const subscriptionIds = checks.map((c: { subscription: string }) => c.subscription);
  const updatedSubscriptions = await processSubscriptions(subscriptionIds);

  return NextResponse.json({
    createdMemoryChecks,
    updatedSubscriptions,
  });
}
