import mongoose from "mongoose";
import { CATEGORIES } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favouriteCategories: [{ type: String, enum: CATEGORIES }],
    reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);