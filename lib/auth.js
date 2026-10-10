import bcrypt from "bcryptjs";
import { COOKIE_NAME, TOKEN_MAX_AGE, verifyToken } from "./jwt";
import { errorResponse } from "./api";

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Never send passwordHash to the client
export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    favouriteCategories: user.favouriteCategories,
  };
}

// Web app: httpOnly cookie (JavaScript on the page cannot read it)
export function attachAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
  return response;
}

// Mobile app: "Authorization: Bearer <token>" is accepted too
function getTokenFromRequest(req) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

/**
 * The server-side gate used by every protected API:
 *   const { user, error } = await requireUser(req, "admin");
 *   if (error) return error;
 */
export async function requireUser(req, role) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: errorResponse("Please log in first", 401) };

  const user = await verifyToken(token);
  if (!user) return { error: errorResponse("Session expired. Please log in again", 401) };

  if (role && user.role !== role) {
    return { error: errorResponse("You do not have access to this", 403) };
  }
  return { user };
}