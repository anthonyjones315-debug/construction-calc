import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`[WEBHOOK_ERROR] ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      console.log(`Payment successful for invoice ${invoiceId}`);
      
      const supabase = createServerClient();
      
      // Attempt to update the invoice status if the table exists
      const { error } = await supabase
        .from("invoices")
        .update({ status: "Paid", paid_at: new Date().toISOString() })
        .eq("id", invoiceId);

      if (error) {
        console.error("Failed to update invoice in Supabase", error);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
