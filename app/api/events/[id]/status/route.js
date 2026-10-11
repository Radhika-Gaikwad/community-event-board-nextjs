import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { toPublicEvent } from "@/lib/events";

// Admin only: make an event Active or Inactive (never deletes)
export const PATCH = handle(async (req, { params }) => {
  const { error } = await requireUser(req, "admin");
  if (error) return error;

  const { id } = await params; // Next 15: params is a Promise
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);

  const body = await req.json().catch(() => ({}));
  if (typeof body.isActive !== "boolean") return errorResponse("isActive must be true or false");

  await connectDB();
  const event = await Event.findByIdAndUpdate(id, { isActive: body.isActive }, { new: true });
  if (!event) return errorResponse("Event not found", 404);

  return NextResponse.json({ event: toPublicEvent(event) });
});