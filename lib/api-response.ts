import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function apiError(message: string, status = 500, details?: unknown) {
  return NextResponse.json<ApiResponse>({ success: false, error: message, details }, { status });
}

export function apiValidationError(errors: unknown) {
  return NextResponse.json<ApiResponse>(
    { success: false, error: "Validation Error", details: errors },
    { status: 400 }
  );
}

export function apiUnauthorized(message = "Unauthorized") {
  return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 401 });
}

export function apiForbidden(message = "Forbidden: Insufficient permissions") {
  return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 403 });
}

export function apiNotFound(message = "Resource not found") {
  return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 404 });
}
