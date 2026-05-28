import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function proxy(req: any) {
    const { pathname } = req.nextUrl;

    const publicPaths = ["/login", "/register"];
    const publicApiPrefixes = ["/api/auth"];

    // Exempt Next.js static assets and favicon
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

    const valid = verifyToken(token);
    if (!valid) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}