import { NextResponse } from "next/server";
import { extractBearerToken, verifyAccessToken } from "@/lib/utils/jwt";
import { getUser } from "@/lib/db/api/user";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    const user = await getUser(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    });
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
