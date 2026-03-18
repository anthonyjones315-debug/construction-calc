export const SHARE_CODE_UNAVAILABLE_MESSAGE =
  "Estimate share links are temporarily unavailable until the saved_estimates.share_code migration is applied.";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(error);
}

export function isMissingShareCodeColumnError(error: unknown): boolean {
  const lower = getErrorMessage(error).toLowerCase();
  return (
    lower.includes("column") &&
    lower.includes("saved_estimates.share_code") &&
    lower.includes("does not exist")
  );
}

export class ShareCodeColumnMissingError extends Error {
  constructor(message: string = SHARE_CODE_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "ShareCodeColumnMissingError";
  }
}
