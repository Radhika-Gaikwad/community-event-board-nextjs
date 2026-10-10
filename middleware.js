import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";

export async function middleware(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

// Runs only for admin pages. We add /feed and /preferences later.
export const config = { matcher: ["/admin/:path*"] };