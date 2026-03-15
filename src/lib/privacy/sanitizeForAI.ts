const PII_OR_PRICING_KEYS = new Set([
  "address",
  "businessemail",
  "businessid",
  "businessname",
  "businessphone",
  "businesswebsite",
  "clientname",
  "cost",
  "email",
  "jobsiteaddress",
  "logo",
  "logourl",
  "margin",
  "markup",
  "markuppercent",
  "markuppercentage",
  "owner",
  "ownerid",
  "phone",
  "price",
  "pricing",
  "profit",
  "rate",
  "totalcost",
  "unitcost",
  "userid",
  "website",
]);

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function shouldStripKey(key: string): boolean {
  return PII_OR_PRICING_KEYS.has(normalizeKey(key));
}

export function sanitizeForAI<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((entry) => sanitizeForAI(entry)) as T;
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  const sanitizedEntries = Object.entries(data as Record<string, unknown>)
    .filter(([key]) => !shouldStripKey(key))
    .map(([key, value]) => [key, sanitizeForAI(value)]);

  return Object.fromEntries(sanitizedEntries) as T;
}
