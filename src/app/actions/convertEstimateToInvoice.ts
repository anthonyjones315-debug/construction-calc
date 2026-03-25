"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  savedEstimates,
  invoices,
  invoiceLineItems,
  businessProfiles,
  projects,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

type LineItemInput = {
  serviceItem: string;
  quantity: number;
  unitCost: number;
  total: number;
};

type EstimateInputs = {
  billing?: {
    invoices?: Array<{
      id?: string;
      invoiceNumber?: string;
      amount?: number;
      issuedDate?: string;
      dueDate?: string;
      status?: string;
    }>;
  };
  lineItems?: LineItemInput[];
  items?: LineItemInput[];
  [key: string]: unknown;
};

/**
 * Converts a saved estimate into an invoice record.
 * Extracts line items from the estimate's JSONB inputs and creates
 * matching invoice_line_items rows.
 */
export async function convertEstimateToInvoice(
  estimateId: string,
  projectId: string,
  customerId: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get user's organizations
  const profiles = await db
    .select({ orgId: businessProfiles.organizationId })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId));

  const orgIds = profiles
    .map((p) => p.orgId)
    .filter((id): id is string => id !== null);

  if (orgIds.length === 0) throw new Error("No organization found");

  // Fetch the estimate (scoped to user)
  const [estimate] = await db
    .select()
    .from(savedEstimates)
    .where(
      and(
        eq(savedEstimates.id, estimateId),
        eq(savedEstimates.userId, userId),
      ),
    )
    .limit(1);

  if (!estimate) throw new Error("Estimate not found");

  // Validate the project belongs to user's org
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        inArray(projects.organizationId, orgIds),
      ),
    )
    .limit(1);

  if (!project) throw new Error("Project not found or unauthorized");

  const organizationId = orgIds[0];

  // Generate an invoice number
  const now = new Date();
  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Extract total
  const totalAmount = estimate.totalCost ?? "0";

  // Extract line items from estimate inputs
  const inputs = estimate.inputs as EstimateInputs | null;
  const rawLineItems: LineItemInput[] =
    inputs?.lineItems ??
    inputs?.items ??
    [];

  // Create the invoice
  const [invoice] = await db
    .insert(invoices)
    .values({
      organizationId,
      projectId,
      customerId,
      invoiceNumber,
      status: "draft",
      dueDate: null,
      totalAmount,
    })
    .returning({ id: invoices.id });

  // Create line items
  if (rawLineItems.length > 0) {
    await db.insert(invoiceLineItems).values(
      rawLineItems.map((item) => ({
        invoiceId: invoice.id,
        serviceItem: item.serviceItem || "Service Item",
        quantity: String(item.quantity ?? 1),
        unitCost: String(item.unitCost ?? 0),
        total: String(item.total ?? 0),
      })),
    );
  }

  return {
    success: true,
    invoiceId: invoice.id,
    invoiceNumber,
  };
}
