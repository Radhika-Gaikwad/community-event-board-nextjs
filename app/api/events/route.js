import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { CATEGORIES } from "@/lib/constants";
import { escapeRegex, toPublicEvent, validateEventInput } from "@/lib/events";

// Public: active + upcoming events, nearest first, with filters and pagination
// GET /api/events?category=Music&city=Coimbatore&q=night&page=1&limit=6
export const GET = handle(async (req) => {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") ?? "").trim();
  const city = (searchParams.get("city") ?? "").trim();
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit"), 10) || 6));

  if (category && !CATEGORIES.includes(category)) return errorResponse("Unknown category");

  // One filter object. Every condition we add is ANDed, so filters work together.
  const filter = { isActive: true, startsAt: { $gte: new Date() } };
  if (category) filter.category = category;
  if (city) filter.city = city;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i"); // case-insensitive "contains"
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  await connectDB();
  const [items, total] = await Promise.all([
    Event.find(filter)
      .sort({ startsAt: 1, _id: 1 }) // _id breaks ties, so pages never repeat or skip items
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);

  return NextResponse.json({
    items: items.map(toPublicEvent),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});
// Admin only: create an event
export const POST = handle(async (req) => {
  const { error } = await requireUser(req, "admin");
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { data, error: validationError } = validateEventInput(body);
  if (validationError) return errorResponse(validationError);

  await connectDB();
  const event = await Event.create(data);
  return NextResponse.json({ event: toPublicEvent(event) }, { status: 201 });
});