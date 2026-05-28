import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Wrong password" });

    const token = signToken({ id: user.id, role: user.role });

    return NextResponse.json({ token, user });
}