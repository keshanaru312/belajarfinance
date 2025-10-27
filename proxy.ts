import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if already has a language prefix
  if (pathname.startsWith("/en") || pathname.startsWith("/bm")) {
    return NextResponse.next();
  }

  // ✅ Handle cookie OR header preference
  const cookieLang = request.cookies.get("preferredLang")?.value;
  const headerLang = request.headers.get("accept-language") || "";

  let preferredLang = "en";
  if (cookieLang === "bm" || headerLang.startsWith("ms")) {
    preferredLang = "bm";
  }

  return NextResponse.redirect(new URL(`/${preferredLang}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"], // exclude static files
};