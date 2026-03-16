export type NysCountyTaxRate = {
  county: string;
  /** Combined state + local sales tax rate as a percentage. */
  combinedRate: number;
  /** Whether the Metropolitan Commuter Transportation District (MCTD) applies. */
  mctd?: boolean;
};

/** New York State state-level sales tax rate (percent). */
export const NYS_STATE_SALES_TAX_RATE = 4;

/**
 * Reference table of common combined state + local sales tax rates for
 * New York State counties. Rates are provided as whole percentages
 * (e.g. 8.75 for 8.75%).
 *
 * These values are based on NYS Department of Taxation & Finance
 * publications and public 2026 rate references. Always verify final
 * taxable amounts with your bookkeeper or accountant for compliance.
 */
export const NYS_COUNTY_TAX_RATES: NysCountyTaxRate[] = [
  { county: "Albany", combinedRate: 8.0 },
  { county: "Allegany", combinedRate: 8.5 },
  { county: "Broome", combinedRate: 8.0 },
  { county: "Cattaraugus", combinedRate: 8.0 },
  { county: "Cayuga", combinedRate: 8.0 },
  { county: "Chautauqua", combinedRate: 8.0 },
  { county: "Chemung", combinedRate: 8.75 },
  { county: "Chenango", combinedRate: 8.0 },
  { county: "Clinton", combinedRate: 8.0 },
  { county: "Columbia", combinedRate: 8.0 },
  { county: "Cortland", combinedRate: 8.0 },
  { county: "Delaware", combinedRate: 8.0 },
  { county: "Dutchess", combinedRate: 8.13, mctd: true },
  { county: "Erie", combinedRate: 8.75 },
  { county: "Essex", combinedRate: 8.0 },
  { county: "Franklin", combinedRate: 8.0 },
  { county: "Fulton", combinedRate: 8.0 },
  { county: "Genesee", combinedRate: 8.0 },
  { county: "Greene", combinedRate: 8.0 },
  { county: "Hamilton", combinedRate: 8.0 },
  { county: "Herkimer", combinedRate: 8.25 },
  { county: "Jefferson", combinedRate: 8.0 },
  { county: "Lewis", combinedRate: 8.0 },
  { county: "Livingston", combinedRate: 8.0 },
  { county: "Madison", combinedRate: 8.0 },
  { county: "Monroe", combinedRate: 8.0 },
  { county: "Montgomery", combinedRate: 8.0 },
  { county: "Nassau", combinedRate: 8.63, mctd: true },
  { county: "New York City", combinedRate: 8.88, mctd: true },
  { county: "Niagara", combinedRate: 8.0 },
  { county: "Oneida", combinedRate: 8.75 },
  { county: "Onondaga", combinedRate: 8.0 },
  { county: "Ontario", combinedRate: 7.5 },
  { county: "Orange", combinedRate: 8.13, mctd: true },
  { county: "Orleans", combinedRate: 8.0 },
  { county: "Oswego", combinedRate: 8.0 },
  { county: "Otsego", combinedRate: 8.0 },
  { county: "Putnam", combinedRate: 8.38, mctd: true },
  { county: "Rensselaer", combinedRate: 8.0 },
  { county: "Rockland", combinedRate: 8.88, mctd: true },
  { county: "St. Lawrence", combinedRate: 8.0 },
  { county: "Saratoga", combinedRate: 7.0 },
  { county: "Schenectady", combinedRate: 8.0 },
  { county: "Schoharie", combinedRate: 8.0 },
  { county: "Schuyler", combinedRate: 8.0 },
  { county: "Seneca", combinedRate: 8.0 },
  { county: "Steuben", combinedRate: 8.0 },
  { county: "Suffolk", combinedRate: 8.63, mctd: true },
  { county: "Sullivan", combinedRate: 8.0 },
  { county: "Tioga", combinedRate: 8.0 },
  { county: "Tompkins", combinedRate: 8.0 },
  { county: "Ulster", combinedRate: 8.0 },
  { county: "Warren", combinedRate: 7.0 },
  { county: "Washington", combinedRate: 7.0 },
  { county: "Wayne", combinedRate: 8.0 },
  { county: "Westchester", combinedRate: 8.38, mctd: true },
  { county: "Wyoming", combinedRate: 8.0 },
  { county: "Yates", combinedRate: 8.0 },
];

export function getNysCountyRate(countyName: string): NysCountyTaxRate | null {
  const normalized = countyName.trim().toLowerCase();
  if (!normalized) return null;

  const match = NYS_COUNTY_TAX_RATES.find(
    (entry) => entry.county.toLowerCase() === normalized,
  );

  return match ?? null;
}

