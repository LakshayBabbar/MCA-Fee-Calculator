import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get("token")?.value;
  const { payload, error } = await verifyToken(
    authToken,
    process.env.ACCESS_SECRET_KEY
  );
  if (error && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (pathname.startsWith("/auth") && payload) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
