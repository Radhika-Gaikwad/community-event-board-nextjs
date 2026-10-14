import mongoose from "mongoose";
import { CATEGORIES } from "../constants.js";
import { CARD_STICKERS, CARD_THEMES } from "../card-design.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favouriteCategories: [{ type: String, enum: CATEGORIES }],
    reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    cardDesigns: [{
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
      theme: { type: String, enum: CARD_THEMES.map((theme) => theme.id), required: true },
      stickers: { type: [String], enum: CARD_STICKERS.map((sticker) => sticker.id), default: [] },
    }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);