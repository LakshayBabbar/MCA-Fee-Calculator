import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get("token")?.value;
  const { payload, error } = await verifyToken(
    authToken,
    process.env.ACCESS_SECRET_KEY
  );
  if (
    error &&
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/auth")
  ) {
    return NextResponse.redirect(new URL("/admin/auth", request.url));
  }
  if (pathname.startsWith("/admin/auth") && payload) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/api/admin") && !payload) {
    return NextResponse.redirect(new URL("/admin/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
