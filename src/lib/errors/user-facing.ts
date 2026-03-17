export type UserFacingErrorDetails = {
  title: string;
  message: string;
};

function getTechnicalMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

export function getUserFacingErrorDetails(
  error: unknown,
  fallback?: Partial<UserFacingErrorDetails>,
): UserFacingErrorDetails {
  const technicalMessage = getTechnicalMessage(error).toLowerCase();
  const hasRequiredValidationPhrase =
    technicalMessage.includes("is required") ||
    technicalMessage.includes("field is required") ||
    technicalMessage.includes("required field") ||
    technicalMessage.includes("required property") ||
    technicalMessage.includes("required parameter");

  if (
    technicalMessage.includes("already registered") ||
    technicalMessage.includes("account with this email already exists") ||
    (technicalMessage.includes("duplicate") &&
      technicalMessage.includes("email") &&
      !technicalMessage.includes("workspace"))
  ) {
    return {
      title: "Account already exists",
      message:
        "That email is already tied to an account. Sign in or reset your password instead of registering again.",
    };
  }

  if (
    technicalMessage.includes("users_email_key") ||
    technicalMessage.includes("businesses_owner_id_fkey") ||
    technicalMessage.includes("ensurepublicuser") ||
    technicalMessage.includes("public user") ||
    technicalMessage.includes("workspace")
  ) {
    return {
      title: "Workspace setup needs another pass",
      message:
        "We couldn't finish linking your account to its workspace yet. Try signing in again. If it still fails, send a report and we'll repair the account link.",
    };
  }

  if (
    technicalMessage.includes("unauthorized") ||
    technicalMessage.includes("forbidden") ||
    technicalMessage.includes("permission") ||
    technicalMessage.includes("session expired") ||
    technicalMessage.includes("sign in")
  ) {
    return {
      title: "Sign in and try again",
      message:
        "Your session may have expired or this action needs a different account. Sign in again, then retry.",
    };
  }

  if (
    technicalMessage.includes("failed to fetch") ||
    technicalMessage.includes("networkerror") ||
    technicalMessage.includes("network request failed") ||
    technicalMessage.includes("load failed") ||
    technicalMessage.includes("timeout")
  ) {
    return {
      title: "We couldn't reach the server",
      message:
        "This looks like a connection problem. Check your internet connection, then try again.",
    };
  }

  if (
    technicalMessage.includes("invalid request") ||
    technicalMessage.includes("invalid payload") ||
    technicalMessage.includes("invalid json") ||
    technicalMessage.includes("request body") ||
    hasRequiredValidationPhrase
  ) {
    return {
      title: "Some information needs another look",
      message:
        "Part of the request was missing or invalid. Review your entries and try again.",
    };
  }

  if (
    technicalMessage.includes("generate pdf") ||
    technicalMessage.includes("pdf")
  ) {
    return {
      title: "PDF export did not finish",
      message:
        "We couldn't build the PDF right now. Your estimate is still in the app, so try the export again in a moment.",
    };
  }

  if (
    technicalMessage.includes("email service") ||
    technicalMessage.includes("failed to send email") ||
    technicalMessage.includes("welcome email") ||
    technicalMessage.includes("resend")
  ) {
    return {
      title: "Email delivery is temporarily down",
      message:
        "The app couldn't send that email right now. Your work is still here, and you can try again shortly.",
    };
  }

  return {
    title: fallback?.title ?? "Something didn’t go through",
    message:
      fallback?.message ??
      "We hit a problem finishing that request. Try again, and if it keeps happening send us a report so we can dig into it.",
  };
}

export function getTechnicalErrorMessage(error: unknown) {
  return getTechnicalMessage(error);
}
