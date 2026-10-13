import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { errorResponse, handle } from "@/lib/api";
import { toPublicEvent } from "@/lib/events";

export const GET = handle(async (_req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);

  await connectDB();
  const event = await Event.findOne({ _id: id, isActive: true, startsAt: { $gte: new Date() } }).lean();
  if (!event) return errorResponse("Upcoming event not found", 404);

  return NextResponse.json({ event: toPublicEvent(event) });
});