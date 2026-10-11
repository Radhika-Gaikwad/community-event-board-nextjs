import { CATEGORIES } from "./constants";

// The shape every API sends to the client
export function toPublicEvent(e) {
  return {
    id: String(e._id),
    title: e.title,
    category: e.category,
    city: e.city,
    startsAt: new Date(e.startsAt).toISOString(),
    createdAt: new Date(e.createdAt).toISOString(),
    price: e.price,
    description: e.description,
    imageUrl: e.imageUrl,
    isActive: e.isActive,
  };
}

// Makes "." or "(" in a search box harmless inside a regular expression
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "  new   delhi " -> "New Delhi", so "pune" and "Pune" don't become two cities
function normalizeCity(city) {
  return city
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Returns { data } with clean values, or { error } with a message to show the user
export function validateEventInput(body) {
  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "");
  const city = normalizeCity(String(body.city ?? ""));
  const description = String(body.description ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const startsAt = new Date(body.startsAt);
  const price = Number(body.price);

  if (!title || title.length > 120) return { error: "Title is required (max 120 characters)" };
  if (!CATEGORIES.includes(category)) return { error: `Category must be one of: ${CATEGORIES.join(", ")}` };
  if (!city || city.length > 60) return { error: "City is required (max 60 characters)" };
  if (!body.startsAt || Number.isNaN(startsAt.getTime())) return { error: "A valid date and time is required" };
  if (body.price === "" || body.price == null || !Number.isFinite(price) || price < 0) {
    return { error: "Price must be 0 or more (enter 0 for a free event)" };
  }
  if (!description || description.length > 2000) return { error: "Description is required (max 2000 characters)" };

  if (!imageUrl) return { error: "Image URL is required" };
  try {
    const url = new URL(imageUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    return { error: "Image URL must be a valid link starting with http:// or https://" };
  }

  // Only these fields are copied, so a client can't sneak in isActive or other fields
  return { data: { title, category, city, startsAt, price: Math.round(price), description, imageUrl } };
}