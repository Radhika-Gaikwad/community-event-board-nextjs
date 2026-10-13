import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";

async function getUpcomingEvent(id) {
  await connectDB();
  return Event.findOne({ _id: id, isActive: true, startsAt: { $gte: new Date() } }).select("_id");
}

export const GET = handle(async (req, { params }) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);
  if (!(await getUpcomingEvent(id))) return errorResponse("Upcoming event not found", 404);

  const user = await User.findById(tokenUser.id).select("reminders");
  if (!user) return errorResponse("Account not found", 401);
  const isReminded = (user.reminders ?? []).some((eventId) => eventId.toString() === id);
  return NextResponse.json({ isReminded });
});

export const PUT = handle(async (req, { params }) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);
  const body = await req.json().catch(() => ({}));
  if (typeof body.isReminded !== "boolean") return errorResponse("isReminded must be true or false");
  if (!(await getUpcomingEvent(id))) return errorResponse("Upcoming event not found", 404);

  const update = body.isReminded ? { $addToSet: { reminders: id } } : { $pull: { reminders: id } };
  const result = await User.updateOne({ _id: tokenUser.id }, update);
  if (result.matchedCount === 0) return errorResponse("Account not found", 401);

  return NextResponse.json({ isReminded: body.isReminded });
});