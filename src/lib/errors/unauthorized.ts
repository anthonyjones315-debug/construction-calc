import { redirect } from "next/navigation";

const DEFAULT_UNAUTHORIZED_REDIRECT = "/unauthorized";

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED";
  readonly redirectPath: string;

  constructor(
    message = "You do not have permission to access this business resource.",
    redirectPath = DEFAULT_UNAUTHORIZED_REDIRECT,
  ) {
    super(message);
    this.name = "UnauthorizedError";
    this.redirectPath = redirectPath;
  }
}

export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function redirectForUnauthorizedError(error: unknown): never | void {
  if (isUnauthorizedError(error)) {
    redirect(error.redirectPath as Parameters<typeof redirect>[0]);
  }
}
