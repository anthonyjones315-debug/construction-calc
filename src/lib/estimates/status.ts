export type EstimateStatus =
  | "Draft"
  | "Sent"
  | "Approved"
  | "Lost"
  | "PENDING"
  | "SIGNED";

export function isEstimateStatus(value: unknown): value is EstimateStatus {
  return (
    value === "Draft" ||
    value === "Sent" ||
    value === "Approved" ||
    value === "Lost" ||
    value === "PENDING" ||
    value === "SIGNED"
  );
}

export function normalizeEstimateStatus(value: unknown): EstimateStatus {
  return isEstimateStatus(value) ? value : "Draft";
}

export function isEstimateSettled(status: EstimateStatus) {
  return status === "Approved" || status === "SIGNED";
}

export function isEstimateOpen(status: EstimateStatus) {
  return status === "Draft" || status === "Sent" || status === "PENDING";
}

export function formatEstimateStatus(status: EstimateStatus) {
  if (status === "Approved") return "Billed";
  if (status === "PENDING") return "Pending Signature";
  if (status === "SIGNED") return "Signed";
  return status;
}
