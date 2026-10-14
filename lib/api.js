import { NextResponse } from "next/server";

export function errorResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Wrap a route handler so an unexpected crash still returns JSON, not an HTML error page
export function handle(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error(err);
      if (["MongooseServerSelectionError", "MongoNetworkError", "MongoNetworkTimeoutError"].includes(err?.name)) {
        return errorResponse("Database is temporarily unavailable. Please try again.", 503);
      }
      return errorResponse("Something went wrong. Please try again.", 500);
    }
  };
}