"use server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { createServerClient } from "@/lib/supabase/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { ensurePublicUserRecord } from "@/lib/supabase/ensurePublicUser";
import { routes } from "@routes";
import {
  getPasswordPolicyError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/security/password-policy";

export type RegisterActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  status?: number;
};

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(120, "Full name must be 120 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`,
    )
    .refine((value) => !getPasswordPolicyError(value), {
      message:
        "Password must be 12-72 characters and include uppercase, lowercase, number, and special character with no spaces.",
    }),
});

function getErrorMessage(error: SupabaseErrorLike | null | undefined): string {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.code === "23505") {
    return "An account with this email already exists.";
  }

  if (
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }

  if (message.includes("password")) {
    return "Password must be 12-72 characters and include uppercase, lowercase, number, and special character with no spaces.";
  }

  return "We could not create your account right now. Please try again.";
}

export async function registerUserAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form input.",
    };
  }

  const { fullName, email, password } = parsed.data;
  const db = createServerClient();
  let welcomeEmailSent = false;
  let publicUserId: string | null = null;
  let shouldSeedBusiness = false;
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: fullName,
      full_name: fullName,
    },
  });

  if (error) {
    console.error("[registerUserAction] failed to create user", {
      email,
      code: error.code,
      status: error.status,
      message: error.message,
    });

    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }

  if (data.user?.id) {
    try {
      publicUserId = await ensurePublicUserRecord(db, {
        id: data.user.id,
        name: fullName,
        email,
        image: null,
      });
      shouldSeedBusiness = true;
    } catch (publicUserError) {
      publicUserId = null;
      console.error("[registerUserAction] failed to upsert public user", {
        userId: data.user.id,
        email,
        message:
          publicUserError instanceof Error
            ? publicUserError.message
            : String(publicUserError),
      });
      Sentry.captureException(publicUserError, {
        tags: { step: "upsert-public-user" },
        extra: { userId: data.user.id },
      });
    }

    if (!shouldSeedBusiness || !publicUserId) {
      console.warn(
        "[registerUserAction] skipped business seed because public user sync failed",
        {
          userId: data.user.id,
          email,
        },
      );
    } else {
      const { data: seededBusiness, error: businessCreateError } = await db
        .from("businesses")
        .insert({
          owner_id: publicUserId,
          name: `${fullName} Business`.slice(0, 200),
        })
        .select("id")
        .single();

      if (businessCreateError) {
        console.error("[registerUserAction] failed to create business", {
          userId: data.user.id,
          email,
          message: businessCreateError.message,
        });
        Sentry.captureException(businessCreateError, {
          tags: { step: "create-business" },
          extra: { userId: data.user.id },
        });
      }

      if (seededBusiness?.id) {
        const { error: membershipError } = await db.from("memberships").upsert(
          {
            business_id: seededBusiness.id,
            user_id: publicUserId,
            role: "owner",
          },
          { onConflict: "business_id,user_id" },
        );

        if (membershipError) {
          console.error("[registerUserAction] failed to create membership", {
            userId: data.user.id,
            businessId: seededBusiness.id,
            email,
            message: membershipError.message,
          });
          Sentry.captureException(membershipError, {
            tags: { step: "create-membership" },
            extra: { userId: data.user.id, businessId: seededBusiness.id },
          });
        }
      }

      if (seededBusiness?.id) {
        const { error: businessProfileError } = await db
          .from("business_profiles")
          .upsert(
            {
              user_id: publicUserId,
              business_id: seededBusiness.id,
              business_email: email,
            },
            { onConflict: "business_id" },
          );

        if (businessProfileError) {
          console.error(
            "[registerUserAction] failed to seed business profile email",
            {
              userId: data.user.id,
              email,
              message: businessProfileError.message,
            },
          );
          Sentry.captureException(businessProfileError, {
            tags: { step: "seed-business-profile" },
            extra: { userId: data.user.id, businessId: seededBusiness.id },
          });
        }
      }
    }
  }

  if (data.user?.id) {
    try {
      await sendWelcomeEmail({
        to: email,
        fullName,
      });
      welcomeEmailSent = true;
    } catch (welcomeEmailError) {
      console.error("[registerUserAction] failed to send welcome email", {
        userId: data.user.id,
        email,
        error:
          welcomeEmailError instanceof Error
            ? welcomeEmailError.message
            : String(welcomeEmailError),
      });
      Sentry.captureException(welcomeEmailError, {
        tags: { step: "send-welcome-email" },
        extra: { userId: data.user.id, email },
      });
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: publicUserId ?? data.user.id,
      event: "user_registered",
      properties: { email },
    });
    posthog.identify({
      distinctId: publicUserId ?? data.user.id,
      properties: { email, name: fullName },
    });
    await posthog.shutdown();
  }

  return {
    status: "success",
    message: welcomeEmailSent
      ? "Account created. Check your inbox for a welcome email, then sign in."
      : "Account created. You can now sign in.",
    redirectTo: `${routes.auth.signIn}?registered=1&welcome=1&callbackUrl=${encodeURIComponent(
      routes.commandCenter,
    )}`,
  };
}
