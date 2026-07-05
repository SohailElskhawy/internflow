import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Next.js static assets, images, favicons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Public page paths
  const publicPages = ["/", "/login", "/register", "/internships"];
  const isPublicPage = publicPages.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  );

  // Public API prefixes
  const publicApiPrefixes = ["/api/auth/login", "/api/auth/register", "/api/auth/logout"];
  const isPublicApi =
    publicApiPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    (pathname === "/api/internships" && req.method === "GET");

  const token = req.cookies.get("token")?.value;
  const decoded = token ? (verifyToken(token) as { id: string; role: string } | null) : null;

  // Handle API routes separately (Never redirect API routes to HTML pages)
  if (pathname.startsWith("/api")) {
    if (!isPublicApi && !decoded) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authentication token required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users visiting protected HTML pages
  if (!isPublicPage && !decoded) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-Based Access Control for Pages
  if (decoded) {
    // If logged-in user visits auth pages, redirect to appropriate dashboard
    if (pathname === "/login" || pathname === "/register") {
      const destination = decoded.role === "COMPANY" ? "/company/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // Student trying to access company pages
    if (pathname.startsWith("/company") && decoded.role !== "COMPANY" && decoded.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Company trying to access student dashboard
    if (pathname.startsWith("/dashboard") && decoded.role !== "STUDENT" && decoded.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/company/dashboard", req.url));
    }

    // Non-admin trying to access admin pages
    if (pathname.startsWith("/admin") && decoded.role !== "ADMIN") {
      const destination = decoded.role === "COMPANY" ? "/company/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};