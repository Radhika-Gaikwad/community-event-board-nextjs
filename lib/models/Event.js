import mongoose from "mongoose";
import { CATEGORIES } from "../constants.js";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    city: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ isActive: 1, category: 1, city: 1, startsAt: 1 });
// Supports the unfiltered list (no category or city chosen)
eventSchema.index({ isActive: 1, startsAt: 1 });

export default mongoose.models.Event || mongoose.model("Event", eventSchema);