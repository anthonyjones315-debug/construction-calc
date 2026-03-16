import Stripe from "stripe";
import "server-only";

const STRIPE_DONATIONS_ENABLED =
  process.env.STRIPE_DONATIONS_ENABLED === "true";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (STRIPE_DONATIONS_ENABLED && !STRIPE_SECRET_KEY) {
  throw new Error(
    "Stripe donations are enabled but STRIPE_SECRET_KEY is not configured.",
  );
}

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!STRIPE_DONATIONS_ENABLED) {
    throw new Error("Stripe donations are not enabled.");
  }

  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }

  return stripeClient;
}

export type DonationIntentPayload = {
  /** Amount in major units (e.g. 25 = $25.00). */
  amount: number;
  /** ISO currency code; currently we expect \"usd\". */
  currency?: string;
  /** Optional memo to attach to metadata, such as campaign or job reference. */
  note?: string;
};

export type DonationIntentResponse = {
  checkoutUrl: string;
  sessionId: string;
};

export function areDonationsEnabled(): boolean {
  return STRIPE_DONATIONS_ENABLED && Boolean(STRIPE_SECRET_KEY);
}

export async function createDonationCheckoutSession(
  payload: DonationIntentPayload,
): Promise<DonationIntentResponse> {
  if (!areDonationsEnabled()) {
    throw new Error("Stripe donations are not enabled.");
  }

  const stripe = getStripeClient();

  const amountInCents = Math.round(Math.max(payload.amount, 0) * 100);
  if (amountInCents <= 0) {
    throw new Error("Donation amount must be greater than zero.");
  }

  const currency = (payload.currency ?? "usd").toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: "Support Pro Construction Calc",
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "donation",
      note: payload.note ?? "",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://proconstructioncalc.com"}/support/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://proconstructioncalc.com"}/support/cancelled`,
  });

  if (!session.url || !session.id) {
    throw new Error("Failed to create Stripe Checkout session for donation.");
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

