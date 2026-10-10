import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/jwt";
import { errorResponse, handle } from "@/lib/api";
import { attachAuthCookie, toPublicUser, verifyPassword } from "@/lib/auth";

export const POST = handle(async (req) => {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) return errorResponse("Email and password are required");

  await connectDB();
  // passwordHash is hidden by default, so we ask for it explicitly
  const user = await User.findOne({ email }).select("+passwordHash");
  const ok = user && (await verifyPassword(password, user.passwordHash));

  // Same message for "no such email" and "wrong password" so attackers can't probe emails
  if (!ok) return errorResponse("Invalid email or password", 401);

  const token = await signToken({ id: user._id.toString(), role: user.role });
  const res = NextResponse.json({ token, user: toPublicUser(user) });
  return attachAuthCookie(res, token);
});