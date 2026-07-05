import { signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Restrict allowed roles during public registration to STUDENT or COMPANY (prevent ADMIN escalation)
        if (!role || (role !== Role.STUDENT && role !== Role.COMPANY)) {
            return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashed, role },
        });

        // Omit password hash from response payload
        const { password: _, ...userWithoutPassword } = user;

        const token = signToken({ id: user.id, role: user.role });
        const response = NextResponse.json({ token, user: userWithoutPassword });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}