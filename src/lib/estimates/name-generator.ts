import { SupabaseClient } from "@supabase/supabase-js";

export async function generateAutoEstimateName(
  db: SupabaseClient,
  tenantId: string,
  tenantColumn: "business_id" | "user_id",
  clientName: string | null | undefined,
  projectName: string | null | undefined,
  jobSiteAddress: string | null | undefined,
  currentEstimateId?: string
): Promise<string> {
  const lastName = clientName?.trim().split(" ").pop() || "Client";
  const project = projectName?.trim() || "Project";
  const address = jobSiteAddress?.trim() || "No Address";

  const baseName = `${lastName} - ${project}`.trim();

  // Query DB for existing estimates with names starting with baseName for this tenant
  const { data, error } = await db
    .from("saved_estimates")
    .select("id, name")
    .eq(tenantColumn, tenantId)
    .ilike("name", `${baseName}%`);

  if (error || !data || data.length === 0) {
    return baseName;
  }

  // Filter out the current estimate if updating
  const existingNames = new Set(
    data
      .filter((d) => d.id !== currentEstimateId)
      .map((d) => (d.name || "").toLowerCase())
  );

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  // Fallback 1: Append Address
  const fallback1 = address !== "No Address" ? `${baseName} - ${address}` : `${baseName}`;
  if (address !== "No Address" && !existingNames.has(fallback1.toLowerCase())) {
    return fallback1;
  }

  // Fallback 2: Append Number
  let counter = 1;
  while (true) {
    const fallbackN = address !== "No Address" 
      ? `${baseName} - ${address} ${counter}`
      : `${baseName} ${counter}`;
    if (!existingNames.has(fallbackN.toLowerCase())) {
      return fallbackN;
    }
    counter++;
  }
}
