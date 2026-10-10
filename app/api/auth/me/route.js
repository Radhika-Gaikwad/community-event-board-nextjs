import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { errorResponse, handle } from "@/lib/api";
import { requireUser, toPublicUser } from "@/lib/auth";

export const GET = handle(async (req) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  await connectDB();
  const user = await User.findById(tokenUser.id);
  if (!user) return errorResponse("Account not found", 401);

  return NextResponse.json({ user: toPublicUser(user) });
});