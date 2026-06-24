import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
const token = await getToken({ req });

const { pathname } = req.nextUrl;

// صفحات تسجيل الدخول
const isAuthPage =
pathname.startsWith("/login") ||
pathname.startsWith("/register");

if (isAuthPage) {
return NextResponse.next();
}

// منع غير المسجلين
if (!token) {
return NextResponse.redirect(new URL("/login", req.url));
}

// 🔥 حماية PRO فقط
const isProtectedRoute =
pathname.startsWith("/dashboard/clients") ||
pathname.startsWith("/dashboard/invoices");

if (isProtectedRoute && token.subscriptionStatus !== "PRO") {
return NextResponse.redirect(new URL("/upgrade", req.url));
}

return NextResponse.next();
}

export const config = {
matcher: ["/dashboard/:path*"],
};
