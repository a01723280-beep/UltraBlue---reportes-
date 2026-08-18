import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Everything except the login screen, its API route and static assets sits
// behind the shared plant password.
export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const url = new URL("/login", request.url);
  // Send the operator back where they were headed once they authenticate.
  const target = request.nextUrl.pathname + request.nextUrl.search;
  if (target && target !== "/") url.searchParams.set("next", target);
  return NextResponse.redirect(url);
}
