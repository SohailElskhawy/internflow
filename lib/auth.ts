import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim() === "") {
        throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.");
    }
    return secret;
}

export function signToken(payload: { id: string; role: string }) {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; role: string } | null {
    try {
        const secret = getJwtSecret();
        return jwt.verify(token, secret) as { id: string; role: string };
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