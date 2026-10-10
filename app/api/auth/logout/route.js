import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/jwt";

export const POST = handle(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
});