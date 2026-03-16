import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import {
  areDonationsEnabled,
  createDonationCheckoutSession,
} from "@/lib/stripe/donations";

const DonationRequestSchema = z.object({
  amount: z.number().positive().max(50_000),
  currency: z.string().optional(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  if (!areDonationsEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parseResult = DonationRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid donation payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { amount, currency, note } = parseResult.data;

    const checkout = await createDonationCheckoutSession({
      amount,
      currency,
      note,
    });

    return NextResponse.json(
      {
        checkoutUrl: checkout.checkoutUrl,
        sessionId: checkout.sessionId,
      },
      { status: 201 },
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Unable to start donation session" },
      { status: 500 },
    );
  }
}

