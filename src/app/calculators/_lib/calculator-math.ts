import { toCents, centsToDollars } from "@/utils/money";
import { scaleCentsByBasisPoints, divideCentsByBasisPoints, toBasisPoints } from "@/utils/rates";
import { calculateNysSalesTax } from "@/services/taxEngine";

export type CalculatorResult = {
  label: string;
  value: string;
  unit: string;
};

export type CalculatorResultsBundle = {
  primary: CalculatorResult;
  secondary: CalculatorResult[];
  materialList: string[];
};


export function getBoardFeet(
  pieces: number,
  thicknessInches: number,
  widthInches: number,
  lengthFeet: number,
) {
  return (pieces * thicknessInches * widthInches * lengthFeet) / 12;
}

export function clampValue(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, n));
}

export type FramingMaterialKind =
  | "wall-studs"
  | "floor-joists"
  | "roof-rafters"
  | "ceiling-joists"
  | "decking";

export type WallStudSpacingMode = "16" | "24" | "custom";
export type WallStudHeightMode = "8-precut" | "9-precut" | "10" | "12" | "custom";
export type RoofingPitchPreset = "flat" | "3" | "4" | "6" | "8" | "10" | "12" | "custom";
export type RoofingInputMode = "dimensions" | "direct-squares";

export interface CalculateResultsParams {
  pageCanonicalPath: string;
  pageCategory: string;
  activeFramingMaterial: FramingMaterialKind;
  wallStudSpacingMode: WallStudSpacingMode;
  wallStudCustomSpacingInches: number;
  widthSpan: number;
  baseMeasurement: number;
  wallStudHeightMode: WallStudHeightMode;
  wallStudCustomHeightFeet: number;
  depthThickness: number;
  totalStudsInput: number;
  isWallStudTotalMode: boolean;
  taxRegion: "NYS" | "Other";
  taxCounty: string;
  capitalImprovement: boolean;
  wasteMultiplier: number;
  totalLinealFeet: number;
  adjustedAreaSquareFeet: number;
  roofingInputMode: RoofingInputMode;
  roofSquaresInput: number;
  roofOverhangInches: number;
  roofPitchPreset: RoofingPitchPreset;
  roofPitchRiseCustom: number;
  dimensionsAreaSquareFeet: number;
  supportsAreaToggle: boolean;
  isAreaTotalMode: boolean;
  totalSquareFeetInput: number;
  staggeredStudWall: boolean;
  openingDeductionSqFt: number;
  deductionSqFt: number;
  adjustedVolume: number;
  adjustedCubicYards: number;
  materialQty: number;
}

export function calculateResults(params: CalculateResultsParams): CalculatorResultsBundle {
  const {
    pageCanonicalPath,
    pageCategory,
    activeFramingMaterial,
    wallStudSpacingMode,
    wallStudCustomSpacingInches,
    widthSpan,
    baseMeasurement,
    wallStudHeightMode,
    wallStudCustomHeightFeet,
    depthThickness,
    totalStudsInput,
    isWallStudTotalMode,
    taxRegion,
    taxCounty,
    capitalImprovement,
    wasteMultiplier,
    totalLinealFeet,
    adjustedAreaSquareFeet,
    roofingInputMode,
    roofSquaresInput,
    roofOverhangInches,
    roofPitchPreset,
    roofPitchRiseCustom,
    dimensionsAreaSquareFeet,
    supportsAreaToggle,
    isAreaTotalMode,
    totalSquareFeetInput,
    staggeredStudWall,
    deductionSqFt,
    adjustedVolume,
    adjustedCubicYards,
    materialQty,
  } = params;

    const isFlooringCalculator = pageCanonicalPath.includes("flooring");
    const isSidingCalculator = pageCanonicalPath.includes("siding");
    const isTrimCalculator =
      pageCanonicalPath.includes("trim") ||
      pageCanonicalPath.includes("baseboard");
    const isDrywallCalculator = pageCanonicalPath.includes("drywall");
    const isWallFramingCalculator =
      pageCategory === "framing" &&
      activeFramingMaterial === "wall-studs" &&
      pageCanonicalPath.includes("/framing/wall");
    const wallSpacingOcInches =
      wallStudSpacingMode === "custom"
        ? clampValue(wallStudCustomSpacingInches, 8, 48)
        : Number(wallStudSpacingMode);
    const spacingOcInches = isWallFramingCalculator
      ? wallSpacingOcInches
      : clampValue(widthSpan, 8, 48);
    const runFeet = clampValue(baseMeasurement, 1, 10000);
    const wallStudLengthFeet = (() => {
      if (!isWallFramingCalculator) return null;
      if (wallStudHeightMode === "8-precut") return 92.625 / 12;
      if (wallStudHeightMode === "9-precut") return 104.625 / 12;
      if (wallStudHeightMode === "10") return 10;
      if (wallStudHeightMode === "12") return 12;
      return clampValue(wallStudCustomHeightFeet, 1, 20);
    })();
    const framingLengthFeet = isWallFramingCalculator
      ? (wallStudLengthFeet ?? 8)
      : clampValue(depthThickness, 1, 10000);
    const nominalLength = Math.max(8, Math.ceil(framingLengthFeet));
    const wallStudTargetCount = Math.max(
      2,
      Math.round(clampValue(totalStudsInput, 2, 50000)),
    );
    const wallDerivedSpacingOcInches =
      (runFeet / Math.max(wallStudTargetCount - 1, 1)) * 12;
    const effectiveSpacingOcInches =
      activeFramingMaterial === "wall-studs" && isWallStudTotalMode
        ? wallDerivedSpacingOcInches
        : spacingOcInches;
    const spacingFeet = effectiveSpacingOcInches / 12;


    if (pageCategory === "business" || pageCategory === "management") {
      const currency = (cents: number) => centsToDollars(cents).toFixed(2);

      if (
        pageCanonicalPath.includes("profit-margin") ||
        pageCanonicalPath.includes("management/margin")
      ) {
        const directCost = clampValue(baseMeasurement, 0, 100000000);
        const overheadPct = clampValue(widthSpan, 0, 100);
        const targetMarginPct = clampValue(depthThickness, 0, 95);
        const directCostCents = toCents(directCost);
        const overheadBasisPoints = toBasisPoints(overheadPct);
        const targetMarginBasisPoints = toBasisPoints(targetMarginPct);
        const overheadCents = scaleCentsByBasisPoints(
          directCostCents,
          overheadBasisPoints,
        );
        const breakEvenPriceCents = directCostCents + overheadCents;
        const sellPriceCents =
          targetMarginPct >= 95
            ? breakEvenPriceCents
            : divideCentsByBasisPoints(
                breakEvenPriceCents,
                10_000 - targetMarginBasisPoints,
              );
        const grossProfitCents = sellPriceCents - breakEvenPriceCents;
        const grossMarginPct =
          sellPriceCents === 0 ? 0 : (grossProfitCents / sellPriceCents) * 100;
        const markupPct =
          directCostCents === 0
            ? 0
            : ((sellPriceCents - directCostCents) / directCostCents) * 100;

        return {
          primary: {
            label: "Bid / Selling Price",
            value: currency(sellPriceCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Break-even Price",
              value: currency(breakEvenPriceCents),
              unit: "$",
            },
            {
              label: "Gross Profit",
              value: currency(grossProfitCents),
              unit: "$",
            },
            {
              label: "Gross Margin",
              value: grossMarginPct.toFixed(1),
              unit: "%",
            },
            {
              label: "Markup on Cost",
              value: markupPct.toFixed(1),
              unit: "%",
            },
          ],
          materialList: [
            `Break-even covers $${currency(overheadCents)} overhead at ${overheadPct.toFixed(1)}%.`,
            `Bid price targets ${targetMarginPct.toFixed(1)}% gross margin (${markupPct.toFixed(1)}% markup).`,
          ],
        };
      }

      if (
        pageCanonicalPath.includes("labor-rate") ||
        pageCanonicalPath.includes("management/labor")
      ) {
        const baseWage = clampValue(baseMeasurement, 0, 1000000);
        const burdenPct = clampValue(widthSpan, 0, 200);
        const overheadPct = clampValue(depthThickness, 0, 200);
        const baseWageCents = toCents(baseWage);
        const burdenBasisPoints = toBasisPoints(burdenPct);
        const overheadBasisPoints = toBasisPoints(overheadPct);
        const burdenedRateCents = scaleCentsByBasisPoints(
          baseWageCents,
          10_000 + burdenBasisPoints,
        );
        const loadedRateCents = scaleCentsByBasisPoints(
          baseWageCents,
          10_000 + burdenBasisPoints + overheadBasisPoints,
        );
        const profitTargetPct = 15;
        const profitTargetBasisPoints = toBasisPoints(profitTargetPct);
        const billableRateCents = divideCentsByBasisPoints(
          loadedRateCents,
          10_000 - profitTargetBasisPoints,
        );
        const profitPerHourCents = billableRateCents - loadedRateCents;

        return {
          primary: {
            label: "Billable Rate (target 15% profit)",
            value: currency(billableRateCents),
            unit: "$/hr",
          },
          secondary: [
            {
              label: "Loaded Cost Rate",
              value: currency(loadedRateCents),
              unit: "$/hr",
            },
            {
              label: "Burdened Labor Rate",
              value: currency(burdenedRateCents),
              unit: "$/hr",
            },
            {
              label: "Profit per Hour",
              value: currency(profitPerHourCents),
              unit: "$/hr",
            },
          ],
          materialList: [
            `Loaded labor includes ${burdenPct.toFixed(1)}% burden and ${overheadPct.toFixed(1)}% overhead.`,
            `Charge ~$${currency(billableRateCents)} per hour to hold ~${profitTargetPct}% profit after overhead.`,
          ],
        };
      }

      if (
        pageCanonicalPath.includes("lead-estimator") ||
        pageCanonicalPath.includes("management/leads")
      ) {
        const costPerLead = clampValue(baseMeasurement, 0, 100000000);
        const closeRatePct = clampValue(widthSpan, 0.01, 100);
        const avgJobValue = clampValue(depthThickness, 0, 1_000_000_000);
        const costPerLeadCents = toCents(costPerLead);
        const avgJobValueCents = toCents(avgJobValue);
        const closeRateBasisPoints = toBasisPoints(closeRatePct);
        const customerAcquisitionCostCents =
          closeRateBasisPoints === 0
            ? 0
            : divideCentsByBasisPoints(costPerLeadCents, closeRateBasisPoints);
        const revenuePerLeadCents = scaleCentsByBasisPoints(
          avgJobValueCents,
          closeRateBasisPoints,
        );
        const paybackMultiple =
          customerAcquisitionCostCents === 0
            ? 0
            : avgJobValueCents / customerAcquisitionCostCents;

        return {
          primary: {
            label: "Customer Acquisition Cost (CAC)",
            value: currency(customerAcquisitionCostCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Revenue per Lead",
              value: currency(revenuePerLeadCents),
              unit: "$",
            },
            {
              label: "Close Rate",
              value: closeRatePct.toFixed(1),
              unit: "%",
            },
            {
              label: "Payback Ratio",
              value: paybackMultiple.toFixed(2),
              unit: "x",
            },
          ],
          materialList: [
            `CAC assumes ${closeRatePct.toFixed(1)}% close rate on $${currency(costPerLeadCents)} CPL.`,
            `Avg job value $${currency(avgJobValueCents)} yields ${paybackMultiple.toFixed(2)}x payback.`,
          ],
        };
      }

      if (pageCanonicalPath.includes("tax-save")) {
        const grossRevenue = clampValue(baseMeasurement, 0, 1_000_000_000);
        const taxRatePct = clampValue(widthSpan, 0, 100);
        const deductionsValue = clampValue(depthThickness, 0, 1_000_000_000);
        const grossRevenueCents = toCents(grossRevenue);
        const deductionsCents = toCents(deductionsValue);
        const taxableIncomeCents = Math.max(
          0,
          grossRevenueCents - deductionsCents,
        );
        const rateSourceCounty =
          taxRegion === "NYS" ? taxCounty : "Custom / Other";
        const taxResult = calculateNysSalesTax({
          county: rateSourceCounty,
          taxableAmount: centsToDollars(taxableIncomeCents),
          projectType: capitalImprovement
            ? "capital-improvement"
            : "repair-maintenance",
          customCombinedRate: taxRegion === "NYS" ? undefined : taxRatePct,
        });
        const rateApplied = taxResult.rateApplied || taxRatePct;
        const rateAppliedBasisPoints = toBasisPoints(rateApplied);
        const taxOwedCents = toCents(taxResult.taxDue);
        const netIncomeCents = Math.max(0, grossRevenueCents - taxOwedCents);
        const effectiveTaxRate =
          grossRevenueCents === 0
            ? 0
            : (taxOwedCents / grossRevenueCents) * 100;
        const taxSavingsCents = capitalImprovement
          ? 0
          : scaleCentsByBasisPoints(
              grossRevenueCents - taxableIncomeCents,
              rateAppliedBasisPoints,
            );

        return {
          primary: {
            label: "Projected Tax",
            value: currency(taxOwedCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Taxable Income",
              value: currency(taxableIncomeCents),
              unit: "$",
            },
            {
              label: "Net Income After Tax",
              value: currency(netIncomeCents),
              unit: "$",
            },
            {
              label: "Effective Tax Rate",
              value: effectiveTaxRate.toFixed(2),
              unit: "%",
            },
            ...(capitalImprovement
              ? [
                  {
                    label: "Capital Improvement",
                    value: "ST-124 on file",
                    unit: "",
                  },
                ]
              : [
                  {
                    label: "State Portion",
                    value: currency(toCents(taxResult.statePortion)),
                    unit: "$",
                  },
                  {
                    label: "Local Portion",
                    value: currency(toCents(taxResult.localPortion)),
                    unit: "$",
                  },
                ]),
            {
              label: "Tax Savings From Deductions",
              value: currency(taxSavingsCents),
              unit: "$",
            },
          ],
          materialList: [
            capitalImprovement
              ? "Capital Improvement: collect NYS Form ST-124; do not charge sales tax on labor."
              : `${rateApplied.toFixed(2)}% blended tax on $${currency(taxableIncomeCents)} taxable income.`,
            capitalImprovement
              ? "Pay sales tax on materials at purchase; retain ST-124 for audit trail."
              : `State: $${currency(toCents(taxResult.statePortion))} · Local: $${currency(toCents(taxResult.localPortion))}`,
            `Deductions reduce tax by $${currency(taxSavingsCents)}.`,
            ...taxResult.notes,
          ],
        };
      }
    }

    if (isDrywallCalculator) {
      const rawAreaSqFt = clampValue(baseMeasurement, 1, 100000000);
      const adjustedArea = rawAreaSqFt * wasteMultiplier;
      const sheets4x8 = Math.max(1, Math.ceil(adjustedArea / 32));
      const sheets4x12 = Math.max(1, Math.ceil(adjustedArea / 48));
      const jointBuckets = Math.max(1, Math.ceil(adjustedArea / 500));
      return {
        primary: {
          label: "Total Sheets (4x8)",
          value: sheets4x8.toString(),
          unit: "sheets",
        },
        secondary: [
          {
            label: "Total Sheets (4x12)",
            value: sheets4x12.toString(),
            unit: "sheets",
          },
          {
            label: "Joint Compound (Buckets)",
            value: jointBuckets.toString(),
            unit: "buckets",
          },
        ],
        materialList: [
          `Order ${sheets4x8} Sheets 4x8 Drywall`,
          `Order ${sheets4x12} Sheets 4x12 Drywall`,
          `Order ${jointBuckets} Buckets Joint Compound`,
        ],
      };
    }

    if (isTrimCalculator) {
      const stockLengthFeet = clampValue(depthThickness, 4, 20);
      const adjustedLinealFeet = totalLinealFeet * wasteMultiplier;
      const stickCount = Math.max(
        1,
        Math.ceil(adjustedLinealFeet / stockLengthFeet),
      );
      return {
        primary: {
          label: "Linear Feet (LF)",
          value: adjustedLinealFeet.toFixed(2),
          unit: "lf",
        },
        secondary: [
          {
            label: "Stock Length",
            value: stockLengthFeet.toFixed(0),
            unit: "ft",
          },
          {
            label: "Full Sticks",
            value: stickCount.toString(),
            unit: "pcs",
          },
        ],
        materialList: [
          `Order ${stickCount} full sticks @ ${stockLengthFeet.toFixed(0)}'`,
        ],
      };
    }

    if (isFlooringCalculator) {
      const sqFtPerBox = clampValue(depthThickness, 1, 250);
      const boxCount = Math.max(
        1,
        Math.ceil(adjustedAreaSquareFeet / sqFtPerBox),
      );
      return {
        primary: {
          label: "Total Boxes",
          value: boxCount.toString(),
          unit: "boxes",
        },
        secondary: [
          {
            label: "Coverage Area",
            value: adjustedAreaSquareFeet.toFixed(2),
            unit: "sq ft",
          },
          {
            label: "Sq Ft per Box",
            value: sqFtPerBox.toFixed(2),
            unit: "sq ft",
          },
        ],
        materialList: [
          `Order ${boxCount} Flooring Boxes`,
          `Coverage planned: ${adjustedAreaSquareFeet.toFixed(2)} sq ft`,
        ],
      };
    }

    if (pageCategory === "framing") {
      if (activeFramingMaterial === "floor-joists") {
        const floorLength = runFeet;
        const floorWidth = framingLengthFeet;
        const totalJoists = Math.max(
          2,
          Math.ceil(floorLength / spacingFeet) + 1,
        );
        const rimJoistsLf = Math.max(1, floorLength * 2 + floorWidth * 2);
        const floorAreaSqFt = floorLength * floorWidth;
        const adjustedFloorArea = floorAreaSqFt * wasteMultiplier;
        const subfloorSheets = Math.max(1, Math.ceil(adjustedFloorArea / 32));
        return {
          primary: {
            label: "Total Joists",
            value: totalJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Rim Joists (LF)",
              value: rimJoistsLf.toFixed(1),
              unit: "lf",
            },
            {
              label: "Subfloor Sheets (4x8)",
              value: subfloorSheets.toString(),
              unit: "sheets",
            },
          ],
          materialList: [
            `Order ${totalJoists} Floor Joists @ ${floorWidth.toFixed(2)}' span`,
            `Order ${rimJoistsLf.toFixed(1)} LF Rim Joist Material`,
            `Order ${subfloorSheets} Sheets 4x8 Subfloor`,
          ],
        };
      }

      if (activeFramingMaterial === "roof-rafters") {
        const totalRafters = Math.max(
          2,
          (Math.ceil(runFeet / spacingFeet) + 1) * 2,
        );
        const boardFeet = getBoardFeet(totalRafters, 2, 10, framingLengthFeet);
        return {
          primary: {
            label: "Total Rafters",
            value: totalRafters.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Rafter Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Rafter Length",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Board Feet (BF)",
              value: boardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `Order ${totalRafters} - 2x10x${nominalLength} Roof Rafters`,
          ],
        };
      }

      if (activeFramingMaterial === "ceiling-joists") {
        const totalCeilingJoists = Math.max(
          2,
          Math.ceil(runFeet / spacingFeet) + 1,
        );
        const boardFeet = getBoardFeet(
          totalCeilingJoists,
          2,
          10,
          framingLengthFeet,
        );
        return {
          primary: {
            label: "Ceiling Joists",
            value: totalCeilingJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Joist Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Joist Length",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Board Feet (BF)",
              value: boardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `Order ${totalCeilingJoists} - 2x10x${nominalLength} Ceiling Joists`,
          ],
        };
      }

      if (activeFramingMaterial === "decking") {
        const totalJoists = Math.max(2, Math.ceil(runFeet / spacingFeet) + 1);
        const boardWidthFeet = clampValue(depthThickness, 1, 12) / 12;
        const deckAreaSquareFeet = runFeet * framingLengthFeet;
        const deckBoards = Math.max(
          1,
          Math.ceil(deckAreaSquareFeet / boardWidthFeet / nominalLength),
        );
        const joistBoardFeet = getBoardFeet(
          totalJoists,
          2,
          10,
          framingLengthFeet,
        );
        const boardBoardFeet = getBoardFeet(deckBoards, 1.25, 6, nominalLength);
        const totalBoardFeet = joistBoardFeet + boardBoardFeet;
        return {
          primary: {
            label: "Deck Joists",
            value: totalJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Decking Boards",
              value: deckBoards.toString(),
              unit: "pcs",
            },
            {
              label: "Deck Joist Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Board Feet (BF)",
              value: totalBoardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `Order ${totalJoists} - 2x10x${nominalLength} Deck Joists`,
            `Order ${deckBoards} - 5/4x6x${nominalLength} Decking Boards`,
          ],
        };
      }

      const derivedStuds = Math.max(2, Math.ceil(runFeet / spacingFeet) + 1);
      // Apply waste to base stud count only (not to the already-rounded-up integer)
      const derivedStudsWithWaste = isWallStudTotalMode
        ? Math.max(2, derivedStuds)
        : Math.ceil(derivedStuds * wasteMultiplier);
      const totalStuds = isWallStudTotalMode
        ? wallStudTargetCount
        : isWallFramingCalculator && staggeredStudWall
          ? Math.max(4, derivedStudsWithWaste * 2)
          : Math.max(8, derivedStudsWithWaste);

      if (pageCanonicalPath.includes("/framing/wall")) {
        // Standard framing: 1 bottom plate + 1 top plate = 2 plates total per run foot
        // Staggered wall: 2 bottom + 2 top = 4 plates
        const plateCount = staggeredStudWall ? 4 : 2;
        const totalPlateLf = runFeet * plateCount;
        const studStockLabel = (() => {
          if (!isWallFramingCalculator) {
            return `${framingLengthFeet.toFixed(2)}'`;
          }
          if (wallStudHeightMode === "8-precut") return `8' precut (92 5/8")`;
          if (wallStudHeightMode === "9-precut") return `9' precut (104 5/8")`;
          if (wallStudHeightMode === "10") return "10'";
          if (wallStudHeightMode === "12") return "12'";
          return `${clampValue(wallStudCustomHeightFeet, 1, 20).toFixed(2)}' (custom)`;
        })();
        return {
          primary: {
            label: "Total Studs",
            value: totalStuds.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Stud Spacing (OC)",
              value: effectiveSpacingOcInches.toFixed(2),
              unit: "in OC",
            },
            {
              label: "Wall Height",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Total Plates (LF)",
              value: totalPlateLf.toFixed(1),
              unit: "lf",
            },
          ],
          materialList: [
            `Order ${totalStuds} - 2x4x${studStockLabel} studs`,
            staggeredStudWall
              ? `Order ${totalPlateLf.toFixed(1)} LF plates (2 bottom + 2 top for staggered wall)`
              : `Order ${totalPlateLf.toFixed(1)} LF plates (1 bottom + 1 top)`,
          ],
        };
      }

      const estimatedOpenings = Math.max(1, Math.round(runFeet / 20));
      const jackStuds = estimatedOpenings * 2;
      const kingStuds = estimatedOpenings * 2;
      const commonStuds = Math.max(0, totalStuds - jackStuds - kingStuds);
      const boardFeet = getBoardFeet(totalStuds, 2, 4, framingLengthFeet);
      const totalPlateLf = runFeet * 2;
      const plates16ft = Math.max(1, Math.ceil(totalPlateLf / 16));
      return {
        primary: {
          label: "Total Studs",
          value: totalStuds.toString(),
          unit: "pcs",
        },
        secondary: [
          {
            label: "Common Studs",
            value: commonStuds.toString(),
            unit: "pcs",
          },
          {
            label: "Jack Studs",
            value: jackStuds.toString(),
            unit: "pcs",
          },
          {
            label: "King Studs",
            value: kingStuds.toString(),
            unit: "pcs",
          },
          {
            label: "Stud Spacing (OC)",
            value: effectiveSpacingOcInches.toFixed(2),
            unit: "in OC",
          },
          {
            label: "Board Feet (BF)",
            value: boardFeet.toFixed(1),
            unit: "bf",
          },
          {
            label: "16' Plates",
            value: plates16ft.toString(),
            unit: "pcs",
          },
        ],
        materialList: [
          `Order ${commonStuds} - 2x4x${nominalLength} Common Studs`,
          `Order ${jackStuds} - 2x4x${nominalLength} Jack Studs`,
          `Order ${kingStuds} - 2x4x${nominalLength} King Studs`,
          `Order (${plates16ft}) 16' Plates`,
        ],
      };
    }

    if (pageCategory === "concrete") {
      if (pageCanonicalPath.includes("block-wall")) {
        const wallAreaSqFt = dimensionsAreaSquareFeet;
        const adjustedArea = wallAreaSqFt * wasteMultiplier;
        const blockFaceHeightInches = clampValue(depthThickness, 4, 16);
        const blockCoverageSqFt = (blockFaceHeightInches / 12) * (16 / 12);
        const totalBlocks = Math.max(
          1,
          Math.ceil(adjustedArea / blockCoverageSqFt),
        );
        const mortarBags = Math.max(1, Math.ceil(totalBlocks / 35));
        const blockSizeLabel = `${blockFaceHeightInches.toFixed(0)}" x 16" CMU`;
        return {
          primary: {
            label: "Total Blocks",
            value: totalBlocks.toString(),
            unit: "blocks",
          },
          secondary: [
            {
              label: "Wall Area",
              value: adjustedArea.toFixed(2),
              unit: "sq ft",
            },
            {
              label: "Bags of Mortar",
              value: mortarBags.toString(),
              unit: "bags",
            },
          ],
          materialList: [
            `Order ${totalBlocks} ${blockSizeLabel}`,
            `Order ${mortarBags} Bags Type S Mortar (70–75 lb)`,
          ],
        };
      }

      const bags80 = Math.ceil(adjustedCubicYards * 45);
      const bags60 = Math.ceil(adjustedCubicYards * 60);
      const estimatedWeightLbs = adjustedCubicYards * 4050;
      const estimatedWeightTons = estimatedWeightLbs / 2000;
      return {
        primary: {
          label: "Total Cubic Yards",
          value: adjustedCubicYards.toFixed(2),
          unit: "yd^3",
        },
        secondary: [
          {
            label: "Bags (80lb)",
            value: bags80.toString(),
            unit: "bags",
          },
          {
            label: "Bags (60lb)",
            value: bags60.toString(),
            unit: "bags",
          },
          {
            label: "Estimated Weight",
            value: estimatedWeightTons.toFixed(2),
            unit: "tons",
          },
        ],
        materialList: [
          `Order ${adjustedCubicYards.toFixed(2)} cu yd`,
          `Order ${bags80} Bags (80lb)`,
          `Order ${bags60} Bags (60lb)`,
          `Approx payload: ${Math.round(estimatedWeightLbs).toLocaleString()} lbs`,
        ],
      };
    }

    if (pageCategory === "roofing") {
      if (isSidingCalculator) {
        const pieceCoverageSqFt = clampValue(depthThickness, 1, 50);
        const pieces = Math.max(
          1,
          Math.ceil(adjustedAreaSquareFeet / pieceCoverageSqFt),
        );
        const sidingSquares = adjustedAreaSquareFeet / 100;
        return {
          primary: {
            label: "Squares",
            value: sidingSquares.toFixed(2),
            unit: "sq",
          },
          secondary: [
            {
              label: "Pieces",
              value: pieces.toString(),
              unit: "pcs",
            },
            {
              label: "Window/Door Deduction",
              value: deductionSqFt.toFixed(2),
              unit: "sq ft",
            },
          ],
          materialList: [
            `Order ${sidingSquares.toFixed(2)} Siding Squares`,
            `Order ${pieces} Siding Pieces`,
          ],
        };
      }

      const isRoofingShinglesCalculator =
        pageCanonicalPath === "/calculators/roofing/shingles";

      const pitchRisePerTwelve =
        isRoofingShinglesCalculator && roofPitchPreset !== "custom"
          ? roofPitchPreset === "flat"
            ? 0
            : Number(roofPitchPreset)
          : clampValue(
              isRoofingShinglesCalculator
                ? roofPitchRiseCustom
                : depthThickness,
              0,
              24,
            );

      const pitchMultiplier =
        pitchRisePerTwelve <= 0
          ? 1
          : Math.sqrt(
              1 + (pitchRisePerTwelve / 12) * (pitchRisePerTwelve / 12),
            );

      const baseRoofArea = (() => {
        if (!isRoofingShinglesCalculator) {
          return supportsAreaToggle && !isAreaTotalMode
            ? dimensionsAreaSquareFeet
            : supportsAreaToggle && isAreaTotalMode
              ? clampValue(totalSquareFeetInput, 1, 100000000)
              : adjustedAreaSquareFeet / wasteMultiplier;
        }

        if (roofingInputMode === "direct-squares") {
          return clampValue(roofSquaresInput, 0.01, 1000000) * 100;
        }

        const lengthFt = clampValue(baseMeasurement, 1, 10000);
        const widthFt = clampValue(widthSpan, 1, 10000);
        const overhangFt = clampValue(roofOverhangInches, 0, 48) / 12;
        const adjustedLength = lengthFt + overhangFt * 2;
        const adjustedWidth = widthFt + overhangFt * 2;
        return adjustedLength * adjustedWidth;
      })();

      const pitchedArea = baseRoofArea * pitchMultiplier;
      const effectiveRoofArea = pitchedArea * wasteMultiplier;
      const squares = effectiveRoofArea / 100;
      const bundles = Math.ceil(squares * 3);

      const starterRidgeBundles = (() => {
        if (!isRoofingShinglesCalculator) return null;

        const overhangFt = clampValue(roofOverhangInches, 0, 48) / 12;
        const perimeterFt =
          roofingInputMode === "dimensions"
            ? (clampValue(baseMeasurement, 1, 10000) + overhangFt * 2) * 2 +
              (clampValue(widthSpan, 1, 10000) + overhangFt * 2) * 2
            : Math.sqrt(baseRoofArea) * 4;

        return Math.max(1, Math.ceil((perimeterFt * 1.1) / 100));
      })();

      const rollsUnderlayment = Math.max(
        1,
        Math.ceil(effectiveRoofArea / 1000),
      );
      const nails = Math.max(1, Math.ceil(squares * 320));
      return {
        primary: {
          label: isRoofingShinglesCalculator
            ? "Order Bundles"
            : "Total Squares",
          value: isRoofingShinglesCalculator
            ? bundles.toString()
            : squares.toFixed(2),
          unit: isRoofingShinglesCalculator ? "bundles" : "sq",
        },
        secondary: [
          {
            label: "Order Squares",
            value: squares.toFixed(2),
            unit: "sq",
          },
          {
            label: "Synthetic Underlayment",
            value: rollsUnderlayment.toString(),
            unit: "rolls",
          },
          ...(starterRidgeBundles
            ? [
                {
                  label: "Starter & Ridge (est.)",
                  value: starterRidgeBundles.toString(),
                  unit: "bundles",
                },
              ]
            : []),
          ...(isRoofingShinglesCalculator
            ? [
                {
                  label: "Nails",
                  value: nails.toLocaleString(),
                  unit: "nails",
                },
              ]
            : []),
        ],
        materialList: [
          `Order ${bundles} Shingle Bundles`,
          `Order ${squares.toFixed(2)} Roofing Squares (pitched & waste-adjusted)`,
          ...(starterRidgeBundles
            ? [`Order ${starterRidgeBundles} Starter & Ridge bundles (est.)`]
            : []),
          `Order ${rollsUnderlayment} Rolls Synthetic Underlayment`,
          ...(isRoofingShinglesCalculator
            ? [
                `Allow ~${nails.toLocaleString()} nails (≈320 nails/square @ 4 nails/shingle).`,
              ]
            : []),
        ],
      };
    }

    /* ── Landscape calculators ─────────────────────────────────── */
    if (pageCategory === "landscape") {
      const p = pageCanonicalPath;

      if (p.includes("sod")) {
        // Sod: area only — rolls, pallets, seed lbs
        const areaSqFt = dimensionsAreaSquareFeet;
        const adjusted = areaSqFt * wasteMultiplier;
        const rolls = Math.ceil(adjusted / 10);
        const pallets = Math.ceil(adjusted / 450);
        const seedLbs = Math.ceil((adjusted / 1000) * 4);
        return {
          primary: {
            label: "Sod Rolls",
            value: rolls.toString(),
            unit: "rolls",
          },
          secondary: [
            { label: "Area", value: adjusted.toFixed(0), unit: "sq ft" },
            {
              label: "Pallets (~450 sq ft ea)",
              value: pallets.toString(),
              unit: "pallets",
            },
            {
              label: "Seed Alternative",
              value: seedLbs.toString(),
              unit: "lbs",
            },
          ],
          materialList: [
            `Order ${rolls} sod rolls (10 sq ft ea)`,
            `Or ${pallets} pallets (~450 sq ft ea)`,
            `Seed alternative: ${seedLbs} lbs (4 lbs/1000 sq ft)`,
          ],
        };
      }

      // Mulch, topsoil, gravel: area × depth → cu yd
      const areaSqFt = dimensionsAreaSquareFeet;
      const depthIn = clampValue(depthThickness, 1, 36);
      const volumeCuFt = areaSqFt * (depthIn / 12);
      const cubicYards = (volumeCuFt / 27) * wasteMultiplier;
      const bags2CuFt = Math.ceil((volumeCuFt * wasteMultiplier) / 2);

      const secondary: Array<{ label: string; value: string; unit: string }> = [
        {
          label: "Volume",
          value: (volumeCuFt * wasteMultiplier).toFixed(1),
          unit: "cu ft",
        },
        { label: "2 cu ft Bags", value: bags2CuFt.toString(), unit: "bags" },
      ];

      const matList: string[] = [
        `Order ${cubicYards.toFixed(2)} cu yd bulk`,
        `Alternate: ${bags2CuFt} bags (2 cu ft ea)`,
      ];

      if (p.includes("gravel")) {
        const tons = cubicYards * 1.4;
        secondary.unshift({
          label: "Tons (est.)",
          value: tons.toFixed(2),
          unit: "tons",
        });
        matList[0] = `Order ${tons.toFixed(2)} tons crushed stone`;
        return {
          primary: { label: "Tons", value: tons.toFixed(2), unit: "tons" },
          secondary,
          materialList: matList,
        };
      }

      if (p.includes("topsoil")) {
        const tonsLow = cubicYards * 1.0;
        const tonsHigh = cubicYards * 1.3;
        secondary.push({
          label: "Tons (est.)",
          value: `${tonsLow.toFixed(1)}–${tonsHigh.toFixed(1)}`,
          unit: "tons",
        });
        matList.push(
          `Approx ${tonsLow.toFixed(1)}–${tonsHigh.toFixed(1)} tons (varies by moisture)`,
        );
      }

      return {
        primary: {
          label: "Cubic Yards",
          value: cubicYards.toFixed(2),
          unit: "cu yd",
        },
        secondary,
        materialList: matList,
      };
    }

    /* ── Outdoor calculators ──────────────────────────────────── */
    if (pageCategory === "outdoor") {
      const p = pageCanonicalPath;

      if (p.includes("fence")) {
        const linearFeet = clampValue(baseMeasurement, 1, 10000);
        const height = clampValue(widthSpan, 3, 12);
        const postSpacing = clampValue(depthThickness, 4, 12);
        const posts = Math.ceil(linearFeet / postSpacing) + 1;
        const sections = posts - 1;
        const railsPerSection = height > 6 ? 3 : 2;
        const rails = sections * railsPerSection;
        const picketsPerSection = Math.ceil((postSpacing * 12) / 4);
        const pickets = Math.ceil(
          sections * picketsPerSection * wasteMultiplier,
        );
        return {
          primary: { label: "Posts", value: posts.toString(), unit: "ea" },
          secondary: [
            { label: "Rails", value: rails.toString(), unit: "ea" },
            { label: "Pickets", value: pickets.toString(), unit: "ea" },
            { label: "Sections", value: sections.toString(), unit: "sections" },
          ],
          materialList: [
            `Order ${posts} posts (4×4, set 48 in below grade)`,
            `Order ${rails} rails (2×4)`,
            `Order ${pickets} pickets (includes waste)`,
          ],
        };
      }

      if (p.includes("paver-patio")) {
        const areaSqFt = dimensionsAreaSquareFeet;
        const baseDepthIn = clampValue(depthThickness, 4, 12);
        const paverSqFt = 0.222; // standard 4×8 brick paver
        const pavers = Math.ceil((areaSqFt * wasteMultiplier) / paverSqFt);
        const baseCuYd = (areaSqFt * (baseDepthIn / 12)) / 27;
        const baseTons = baseCuYd * 1.4;
        const sandCuYd = (areaSqFt * (1 / 12)) / 27; // 1 in sand bedding
        const sandTons = sandCuYd * 1.4;
        const perimeter = (baseMeasurement + widthSpan) * 2;
        return {
          primary: { label: "Pavers", value: pavers.toString(), unit: "ea" },
          secondary: [
            { label: "Gravel Base", value: baseTons.toFixed(2), unit: "tons" },
            { label: "Sand Bedding", value: sandTons.toFixed(2), unit: "tons" },
            {
              label: "Edge Restraint",
              value: perimeter.toFixed(0),
              unit: "LF",
            },
          ],
          materialList: [
            `Order ${pavers} pavers (4×8 standard)`,
            `Order ${baseTons.toFixed(2)} tons gravel base (${baseDepthIn} in depth)`,
            `Order ${sandTons.toFixed(2)} tons sand (1 in bedding)`,
            `Edge restraint: ${perimeter.toFixed(0)} LF`,
          ],
        };
      }

      if (p.includes("asphalt")) {
        const areaSqFt = dimensionsAreaSquareFeet;
        const thicknessIn = clampValue(depthThickness, 1, 6);
        const volumeCuFt = areaSqFt * (thicknessIn / 12);
        const tons = ((volumeCuFt * 145) / 2000) * wasteMultiplier; // 145 lbs/cu ft
        return {
          primary: { label: "Tons", value: tons.toFixed(2), unit: "tons" },
          secondary: [
            { label: "Area", value: areaSqFt.toFixed(0), unit: "sq ft" },
            { label: "Thickness", value: thicknessIn.toFixed(1), unit: "in" },
          ],
          materialList: [
            `Order ${tons.toFixed(2)} tons hot mix asphalt`,
            `Coverage: ${areaSqFt.toFixed(0)} sq ft at ${thicknessIn.toFixed(1)} in compacted`,
          ],
        };
      }
    }

    return {
      primary: {
        label: "Estimated Quantity",
        value: adjustedVolume.toFixed(2),
        unit: "units",
      },
      secondary: [
        {
          label: "Material Qty",
          value: materialQty.toString(),
          unit: "units",
        },
      ],
      materialList: [`Order ${materialQty} Material Units`],
    };
}
