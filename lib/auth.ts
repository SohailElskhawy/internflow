import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { env } from "@/src/config/env";

export function signToken(payload: { id: string; role: string }) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; role: string } | null {
    try {
        return jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    } catch {
        return null;
    }
}

export function getAuthSession(req: NextRequest): { id: string; role: string } | null {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    return decoded || null;
}