import { signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// app/api/auth/register/route.ts
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashed, role },
        });

        const token = signToken({ id: user.id, role: user.role });
        const response = NextResponse.json({ token, user });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error: any) {
        // Specifically trap Prisma unique constraint errors if you are enforcing unique emails!
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}