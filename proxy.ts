import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (match) {
    const locale = match[1];
    const rest = match[2] || "/";
    const response = NextResponse.rewrite(new URL(rest, request.url));
    response.cookies.set("lang", locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
