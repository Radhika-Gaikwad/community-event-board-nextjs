import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { CATEGORIES } from "@/lib/constants";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async (req) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  await connectDB();
  const user = await User.findById(tokenUser.id).select("favouriteCategories");
  if (!user) return errorResponse("Account not found", 401);

  return NextResponse.json({ categories: user.favouriteCategories ?? [] });
});

export const PUT = handle(async (req) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body.categories)) return errorResponse("categories must be an array");
  if (body.categories.some((category) => !CATEGORIES.includes(category))) {
    return errorResponse(`Categories must be selected from: ${CATEGORIES.join(", ")}`);
  }

  const categories = [...new Set(body.categories)];
  await connectDB();
  const user = await User.findByIdAndUpdate(
    tokenUser.id,
    { favouriteCategories: categories },
    { new: true, runValidators: true }
  ).select("favouriteCategories");
  if (!user) return errorResponse("Account not found", 401);

  return NextResponse.json({ categories: user.favouriteCategories });
});