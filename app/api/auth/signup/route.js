import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/jwt";
import { errorResponse, handle } from "@/lib/api";
import { attachAuthCookie, hashPassword, toPublicUser } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = handle(async (req) => {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!EMAIL_RE.test(email)) return errorResponse("Enter a valid email address");
  if (password.length < 8) return errorResponse("Password must be at least 8 characters");

  await connectDB();
  if (await User.exists({ email })) {
    return errorResponse("An account with this email already exists", 409);
  }

  let user;
  try {
    user = await User.create({ email, passwordHash: await hashPassword(password) });
  } catch (err) {
    // two signups at the same moment: the unique index catches it
    if (err.code === 11000) return errorResponse("An account with this email already exists", 409);
    throw err;
  }

  const token = await signToken({ id: user._id.toString(), role: user.role });
  const res = NextResponse.json({ token, user: toPublicUser(user) }, { status: 201 });
  return attachAuthCookie(res, token);
});