import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { errorResponse, handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { CARD_STICKERS, CARD_THEMES, DEFAULT_CARD_DESIGN } from "@/lib/card-design";

const THEMES = CARD_THEMES.map((theme) => theme.id);
const STICKERS = CARD_STICKERS.map((sticker) => sticker.id);

async function findAvailableEvent(id) {
  await connectDB();
  return Event.exists({ _id: id, isActive: true, startsAt: { $gte: new Date() } });
}

export const GET = handle(async (req, { params }) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);
  if (!(await findAvailableEvent(id))) return errorResponse("Upcoming event not found", 404);

  const user = await User.findById(tokenUser.id).select("cardDesigns");
  if (!user) return errorResponse("Account not found", 401);
  const saved = user.cardDesigns.find((design) => design.eventId.toString() === id);
  return NextResponse.json({ design: saved ? { theme: saved.theme, stickers: saved.stickers } : DEFAULT_CARD_DESIGN, saved: Boolean(saved) });
});

export const PUT = handle(async (req, { params }) => {
  const { user: tokenUser, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorResponse("Event not found", 404);
  const body = await req.json().catch(() => ({}));
  if (!THEMES.includes(body.theme)) return errorResponse("Choose a valid card theme");
  if (!Array.isArray(body.stickers)) return errorResponse("stickers must be an array");
  if (body.stickers.length > 3) return errorResponse("A card can have at most 3 stickers");
  if (body.stickers.some((sticker) => !STICKERS.includes(sticker))) return errorResponse("Choose valid stickers");
  if (new Set(body.stickers).size !== body.stickers.length) return errorResponse("A sticker can only be added once");
  if (!(await findAvailableEvent(id))) return errorResponse("Upcoming event not found", 404);

  const user = await User.findById(tokenUser.id).select("cardDesigns");
  if (!user) return errorResponse("Account not found", 401);
  const design = user.cardDesigns.find((item) => item.eventId.toString() === id);
  if (design) {
    design.theme = body.theme;
    design.stickers = body.stickers;
  } else {
    user.cardDesigns.push({ eventId: id, theme: body.theme, stickers: body.stickers });
  }
  await user.save();

  return NextResponse.json({ design: { theme: body.theme, stickers: body.stickers }, saved: true });
});