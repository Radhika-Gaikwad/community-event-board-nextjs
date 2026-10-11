import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { escapeRegex, toPublicEvent } from "@/lib/events";

const SORT_FIELDS = {
  title: "title",
  category: "category",
  city: "city",
  startsAt: "startsAt",
  createdAt: "createdAt",
  price: "price",
  status: "isActive",
};

export const GET = handle(async (req) => {
  const { error } = await requireUser(req, "admin");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const status = searchParams.get("status") || "all";
  const sort = SORT_FIELDS[searchParams.get("sort")] ? searchParams.get("sort") : "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const requestedPage = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit"), 10) || 5));

  if (!["all", "active", "inactive"].includes(status)) {
    return Response.json({ error: "Unknown status filter" }, { status: 400 });
  }

  const filter = {};
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { title: pattern },
      { category: pattern },
      { city: pattern },
      { description: pattern },
    ];
  }

  await connectDB();
  const total = await Event.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const page = Math.min(requestedPage, Math.max(1, totalPages));
  const events = await Event.find(filter)
    .sort({ [SORT_FIELDS[sort]]: order === "asc" ? 1 : -1, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    events: events.map(toPublicEvent),
    q,
    status,
    sort,
    order,
    page,
    limit,
    total,
    totalPages,
  });
});