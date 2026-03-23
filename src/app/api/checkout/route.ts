import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth/config";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, invoiceId, jobName, customerEmail } = body;

    if (!amount || !invoiceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Amount must be passed in cents (e.g., $1000.00 -> 100000)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "us_bank_account"],
      customer_email: customerEmail,
      client_reference_id: invoiceId,
      metadata: {
        invoiceId,
        userId: session.user.id,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice for ${jobName || "Construction Job"}`,
              description: `Payment for Invoice #${invoiceId}`,
            },
            unit_amount: Math.round(amount * 100), // convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/crm?success=true&invoiceId=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/crm?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
