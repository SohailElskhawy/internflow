import { cookies } from "next/headers";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return apiSuccess({ message: "Successfully logged out" });
}
