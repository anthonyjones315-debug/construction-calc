import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

const BUCKET = "business_logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

function newErrorId() {
  return crypto.randomUUID();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function uploadWithBucketRecovery(
  db: ReturnType<typeof createServerClient>,
  path: string,
  buffer: Buffer,
  contentType: string,
) {
  const firstAttempt = await db.storage
    .from(BUCKET)
    .upload(path, buffer, { upsert: true, contentType });

  if (!firstAttempt.error) return firstAttempt;

  const message = firstAttempt.error.message.toLowerCase();
  const bucketMissing =
    message.includes("bucket") &&
    (message.includes("not found") || message.includes("does not exist"));

  if (!bucketMissing) return firstAttempt;

  const createBucketResult = await db.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_BYTES}`,
    allowedMimeTypes: ALLOWED_TYPES,
  });

  if (createBucketResult.error) {
    return {
      data: null,
      error: createBucketResult.error,
    };
  }

  return db.storage.from(BUCKET).upload(path, buffer, {
    upsert: true,
    contentType,
  });
}

export async function POST(req: NextRequest) {
  const requestId = newErrorId();

  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_BYTES)
      return NextResponse.json(
        { error: "Logo must be under 2MB" },
        { status: 400 },
      );
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, WebP, SVG, or GIF" },
        { status: 400 },
      );

    const ext = file.name.split(".").pop() ?? "png";

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    if (!businessContext.isOwner) {
      return NextResponse.json(
        {
          error: "Only business owners can update business-wide settings.",
        },
        { status: 403 },
      );
    }
    const storageScopeId = businessContext.usesLegacyUserScope
      ? session.user.id
      : businessContext.businessId;
    const path = `${storageScopeId}/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await uploadWithBucketRecovery(
      db,
      path,
      buffer,
      file.type,
    );

    if (error) {
      console.error("[logo-upload] storage upload failed", {
        requestId,
        message: error.message,
      });
      return NextResponse.json(
        {
          error: `Upload failed: ${error.message} (ref: ${requestId})`,
        },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = db.storage.from(BUCKET).getPublicUrl(path);

    // Persist logo URL to DB immediately so it doesn't require a separate "Save"
    try {
      const { error: dbError } = await db.from("business_profiles").upsert(
        {
          user_id: session.user.id,
          ...(businessContext.usesLegacyUserScope
            ? {}
            : { business_id: businessContext.businessId }),
          logo_url: publicUrl,
        },
        {
          onConflict: businessContext.usesLegacyUserScope
            ? "user_id"
            : "business_id",
        },
      );
      if (dbError) {
        console.error("[logo-upload] db persist failed", {
          requestId,
          message: dbError.message,
        });
      }
    } catch (dbPersistError) {
      console.error("[logo-upload] db persist exception", {
        requestId,
        message: errorMessage(dbPersistError),
      });
    }

    revalidateTag("user", "max");
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (error) {
    console.error("[logo-upload] route exception", {
      requestId,
      message: errorMessage(error),
    });
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";
    return NextResponse.json(
      { error: `Upload failed: ${message} (ref: ${requestId})` },
      { status: 500 },
    );
  }
}
