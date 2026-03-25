import { NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/utils/jwt";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch {
    return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }
}
