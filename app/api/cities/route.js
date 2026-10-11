import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { handle } from "@/lib/api";

// Public: cities that currently have active, upcoming events
export const GET = handle(async () => {
  await connectDB();
  const cities = await Event.distinct("city", { isActive: true, startsAt: { $gte: new Date() } });
  cities.sort((a, b) => a.localeCompare(b));
  return NextResponse.json({ cities });
});