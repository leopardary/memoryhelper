import { extractBearerToken, verifyAccessToken, JWTPayload } from "@/lib/utils/jwt";
import { NextResponse } from "next/server";

/**
 * Authenticate a mobile request via Bearer token.
 * Returns the JWT payload if valid, or a NextResponse error.
 */
export async function authenticateMobile(req: Request): Promise<JWTPayload | NextResponse> {
  const authHeader = req.headers.get("Authorization");
  const token = extractBearerToken(authHeader);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

/**
 * Type guard to check if authenticateMobile returned an error response
 */
export function isAuthError(result: JWTPayload | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
