import { NextResponse } from "next/server";
import { getUserByEmail, findOrCreateUser } from "@/lib/db/api/user"
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password, imageUrl } = await req.json();

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await findOrCreateUser({
    name,
    email,
    password: hashedPassword,
    imageUrl: imageUrl || undefined
  });

  return NextResponse.json({ message: "User created" }, { status: 200 });
}
