import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// get student profile
export async function GET(req: NextRequest) {
    // 1. Extract and verify token from the secure cookie
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    // 2. Fetch the profile securely
    const profile = await prisma.studentProfile.findUnique({
        where: { userId: userId },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json(profile);
}

// update or create student profile
export async function POST(req: NextRequest) {
    // 1. Validate auth token from cookie securely (do NOT trust the client to send userId)
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    // 2. Safely parse and extract body fields
    const body = await req.json();
    const university = body.university;
    const major = body.major;
    const skills = body.skills;
    const cvUrl = body.cvUrl;

    // 3. Reject the request if essential data is completely missing
    if (!university || !major || !Array.isArray(skills)) {
        return NextResponse.json({ error: "Missing or invalid required fields (university, major, skills array)" }, { status: 400 });
    }

    // 4. Force cvUrl to strictly be either a valid string or null (never undefined or empty string)
    const sanitizedCvUrl = (cvUrl && typeof cvUrl === "string" && cvUrl.trim() !== "") ? cvUrl : null;

    try {
        // Guarantee strict types for the required columns
        const guaranteedUniversity = String(university || "");
        const guaranteedMajor = String(major || "");
        const guaranteedSkills = Array.isArray(skills) ? skills : [];

        let profile = await prisma.studentProfile.findUnique({
            where: { userId: userId }
        });

        if (profile) {
            profile = await prisma.studentProfile.update({
                where: { userId: userId },
                data: {
                    university: guaranteedUniversity,
                    major: guaranteedMajor,
                    skills: guaranteedSkills,
                    cvUrl: sanitizedCvUrl
                }
            });
        } else {
            profile = await prisma.studentProfile.create({
                data: {
                    userId: userId,
                    university: guaranteedUniversity,
                    major: guaranteedMajor,
                    skills: guaranteedSkills,
                    cvUrl: sanitizedCvUrl
                }
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Prisma error:", error);
        return NextResponse.json({ error: "Database error while saving profile." }, { status: 500 });
    }
}