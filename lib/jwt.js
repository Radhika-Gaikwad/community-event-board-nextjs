import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in .env.local");
  return new TextEncoder().encode(secret);
}

export async function signToken({ id, role }) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

// Returns { id, role } for a valid token, or null for a bad/expired one
export async function verifyToken(token) {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}