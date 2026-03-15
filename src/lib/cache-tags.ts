export const FINANCIAL_DASHBOARD_TAG = "financial-dashboard";
export const SAVED_ESTIMATES_TAG = "saved-estimates";
export const ESTIMATE_TAG = "estimate";

export function getFinancialDashboardTag(userId: string): string {
  return `${FINANCIAL_DASHBOARD_TAG}:${userId}`;
}

export function getSavedEstimatesTag(userId: string): string {
  return `${SAVED_ESTIMATES_TAG}:${userId}`;
}

export function getEstimateTag(estimateId: string): string {
  return `${ESTIMATE_TAG}:${estimateId}`;
}
