"use server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

export type RegisterActionState = {
  status: "idle" | "success" | "error";
  message?: string;
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
    .min(8, "Password too short. Use at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
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

  if (message.includes("password") && message.includes("at least 8")) {
    return "Password too short. Use at least 8 characters.";
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
    const { error: publicUserError } = await db.from("users").upsert(
      {
        id: data.user.id,
        name: fullName,
        email,
        image: null,
      },
      { onConflict: "id" },
    );

    if (publicUserError) {
      console.error("[registerUserAction] failed to upsert public user", {
        userId: data.user.id,
        email,
        message: publicUserError.message,
      });
    }

    const { data: seededBusiness, error: businessCreateError } = await db
      .from("businesses")
      .insert({
        owner_id: data.user.id,
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
    }

    if (seededBusiness?.id) {
      const { error: membershipError } = await db.from("memberships").upsert(
        {
          business_id: seededBusiness.id,
          user_id: data.user.id,
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
      }
    }

    if (seededBusiness?.id) {
      const { error: businessProfileError } = await db
        .from("business_profiles")
        .upsert(
          {
            user_id: data.user.id,
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
      }
    }
  }

  return {
    status: "success",
    message: "Account created. You can now sign in.",
  };
}
