import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  return await Sentry.startSpan({ name: "Documenso Webhook Receiver" }, async () => {
    try {
      const rawBody = await req.text();
      const secret = process.env.WEBHOOK_SECRET || process.env.DOCUMENSO_WEBHOOK_SECRET;
      
      if (secret) {
        // Support common webhook signature header names
        const signature = req.headers.get("x-documenso-signature") || req.headers.get("webhook-signature");
        if (!signature) {
             return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
        }
        
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(rawBody)
          .digest("hex");
          
        if (signature !== expectedSignature) {
           return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }

      const payload = JSON.parse(rawBody);
      
      // Pluck the core webhook structure parameters 
      const eventType = payload.event;
      const document = payload.document ?? payload.data;
      
      if (!document?.externalId) {
         // Silently ignore payloads not tied to an estimate
         return NextResponse.json({ message: "No external ID provided; skipping." });
      }

      if (eventType === "document.completed" || eventType === "DOCUMENT_COMPLETED" || eventType === "document.signed") {
        const db = createServerClient();
        
        // Multi-tenant resolution: We match strictly against the estimate ID.
        // The business context is naturally enforced via RLS if needed, but since webhooks run server-side, 
        // we use service role or direct ID updates.
        const { error } = await db
          .from("saved_estimates")
          .update({
            status: "SIGNED",
            // Depending strictly on JSONb updates might require an RPC, but we can patch the root status field
          })
          .eq("id", document.externalId);
          
        if (error) {
          throw new Error(`Supabase Update Error for Estimate ${document.externalId}: ${error.message}`);
        }
      }

      return NextResponse.json({ received: true, status: "processed", docId: document.externalId });
    } catch (err) {
      Sentry.captureException(err);
      return NextResponse.json({ error: "Webhook Processing Error" }, { status: 500 });
    }
  });
}
