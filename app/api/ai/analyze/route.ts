import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiValidationError } from "@/lib/api-response";
import { analyzeStudentResume, getStudentResumeAnalysis } from "@/lib/services/resume.service";
import { parsePdfToText } from "@/lib/ai/pdf-parser";
import { analyzeResumeSchema } from "@/validators/ai.validator";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();
    
    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can access resume analysis");
    }

    if (!user.studentId) {
      return apiError("Student profile not found", 404);
    }

    const analysis = await getStudentResumeAnalysis(user.studentId);
    return apiSuccess(analysis);
  } catch (error) {
    logger.error("Error in GET /api/ai/analyze", error);
    return apiError("Failed to fetch resume analysis", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can trigger resume analysis");
    }

    if (!user.studentId) {
      return apiError("Student profile not found", 404);
    }

    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textParam = formData.get("resumeText") as string | null;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        resumeText = await parsePdfToText(buffer);
      } else if (textParam) {
        resumeText = textParam;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      const validation = analyzeResumeSchema.safeParse(body);
      if (!validation.success) {
        return apiValidationError(validation.error.flatten().fieldErrors);
      }
      resumeText = validation.data.resumeText || "";
    }

    if (!resumeText || resumeText.length < 20) {
      return apiError("Please provide a valid resume file (PDF) or raw resume text (min 20 characters)", 400);
    }

    const analysis = await analyzeStudentResume(user.studentId, resumeText);
    return apiSuccess(analysis, 201);
  } catch (error) {
    logger.error("Error in POST /api/ai/analyze", error);
    return apiError("Failed to analyze resume", 500);
  }
}
