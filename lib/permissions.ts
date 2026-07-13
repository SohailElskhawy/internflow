import { CurrentUser } from "./current-user";
import { Role } from "@prisma/client";

export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message = "Forbidden: Insufficient permissions", statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number;

  constructor(message = "Unauthorized: Authentication required", statusCode = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = statusCode;
  }
}

export function requireAuth(user: CurrentUser | null): CurrentUser {
  if (!user) {
    throw new AuthenticationError("User is not authenticated");
  }
  return user;
}

export function requireRole(user: CurrentUser | null, allowedRoles: Role[]): CurrentUser {
  const authUser = requireAuth(user);
  if (!allowedRoles.includes(authUser.role)) {
    throw new AuthorizationError(`Role '${authUser.role}' is not authorized for this operation`);
  }
  return authUser;
}

export function requireStudent(user: CurrentUser | null): CurrentUser {
  return requireRole(user, [Role.STUDENT, Role.ADMIN]);
}

export function requireCompany(user: CurrentUser | null): CurrentUser {
  return requireRole(user, [Role.COMPANY, Role.ADMIN]);
}

export function requireAdmin(user: CurrentUser | null): CurrentUser {
  return requireRole(user, [Role.ADMIN]);
}
