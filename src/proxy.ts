import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value;
  if (userId) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set("user_id", crypto.randomUUID(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|serwist|icons|manifest|favicon|sw.js|workbox).*)",
  ],
};
