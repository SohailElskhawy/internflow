import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function proxy(req: any) {
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