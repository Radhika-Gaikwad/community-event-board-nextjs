import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { toPublicEvent } from "@/lib/events";

export const GET = handle(async (req) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
  const limit = Math.min(20, Math.max(1, Number.parseInt(searchParams.get("limit"), 10) || 6));

  await connectDB();
  const user = await User.findById(tokenUser.id).select("favouriteCategories");
  if (!user) return errorResponse("Account not found", 401);

  const categories = user.favouriteCategories ?? [];
  if (categories.length === 0) {
    return NextResponse.json({ items: [], categories, page: 1, limit, total: 0, totalPages: 0 });
  }

  const filter = { isActive: true, startsAt: { $gte: new Date() }, category: { $in: categories } };
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);

  return NextResponse.json({
    items: events.map(toPublicEvent),
    categories,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});