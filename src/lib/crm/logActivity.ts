import { db } from "@/db";
import { customerActivityLogs } from "@/db/schema";

type LogActivityArgs = {
  organizationId: string;
  customerId: string;
  userId?: string | null;
  eventType:
    | "email_sent"
    | "estimate_viewed"
    | "estimate_signed"
    | "phone_call"
    | "note_added"
    | "meeting_scheduled"
    | "invoice_sent"
    | "invoice_paid";
  description: string;
  metadata?: Record<string, unknown>;
};

/**
 * Logs a customer activity event. Use this as a hook wrapper
 * around email sends, estimate dispatches, and invoice actions
 * to create an automatic audit trail in the CRM.
 */
export async function logCustomerActivity({
  organizationId,
  customerId,
  userId,
  eventType,
  description,
  metadata,
}: LogActivityArgs) {
  const [row] = await db
    .insert(customerActivityLogs)
    .values({
      organizationId,
      customerId,
      userId: userId ?? undefined,
      eventType,
      description,
      metadata: metadata ?? {},
    })
    .returning({ id: customerActivityLogs.id });

  return row;
}
