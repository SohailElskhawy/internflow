import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicPaths = ["/login", "/register", "/internships"];
    const publicApiPrefixes = ["/api/auth", "/api/internships"];

    // Exempt Next.js static assets, favicon, and public listings
    if (
        pathname.startsWith("/_next") || 
        pathname.startsWith("/static") || 
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    if (
        publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
        publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based route protection
    if (pathname.startsWith("/company") && decoded.role !== "COMPANY") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/dashboard") && decoded.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/company/dashboard", req.url));
    }

    return NextResponse.next();
}