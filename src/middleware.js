import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get("token")?.value;
  const { payload, error } = await verifyToken(
    authToken,
    process.env.ACCESS_SECRET_KEY
  );
  if (pathname.startsWith("/auth") || pathname.startsWith("/")) {
    return NextResponse.next();
  }
  if (error && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: "/:path*",
};
