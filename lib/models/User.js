import mongoose from "mongoose";
import { CATEGORIES } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means queries do NOT return the hash unless asked for
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favouriteCategories: [{ type: String, enum: CATEGORIES }],
  },
  { timestamps: true }
);

// The "||" part stops "OverwriteModelError" when Next.js reloads this file
export default mongoose.models.User || mongoose.model("User", userSchema);