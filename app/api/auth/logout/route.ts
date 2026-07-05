import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const response = apiSuccess({ message: "Successfully logged out" });
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
