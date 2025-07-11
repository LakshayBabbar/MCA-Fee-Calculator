import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const allowedOrigins = ["http://localhost:5173", "https://crm.wishlegals.com"];

export async function middleware(request) {
  const origin = request.headers.get("origin");

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response("CORS error: origin not allowed", {
      status: 403,
    });
  }

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

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

  return response;
}

export const config = {
  matcher: "/:path*",
};
