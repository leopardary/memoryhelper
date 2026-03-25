import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/api/user";
import { generateAccessToken, generateRefreshToken } from "@/lib/utils/jwt";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { env } from "@/lib/env";
import { findOrCreateUser } from "@/lib/db/api/user";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { email, password, googleIdToken } = await req.json();

    // Google Sign-In flow
    if (googleIdToken) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleIdToken,
          audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        // Find or create user from Google account
        const user = await findOrCreateUser({
          name: payload.name || "",
          email: payload.email,
          imageUrl: payload.picture || "",
          defaultRole: "visitor",
        });

        const tokenPayload = { userId: user.id, email: user.email };
        return NextResponse.json({
          accessToken: generateAccessToken(tokenPayload),
          refreshToken: generateRefreshToken(tokenPayload),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
          },
        });
      } catch {
        return NextResponse.json({ error: "Google authentication failed" }, { status: 401 });
      }
    }

    // Email/password flow
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const tokenPayload = { userId: user.id, email: user.email };
    return NextResponse.json({
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error("Mobile sign-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
