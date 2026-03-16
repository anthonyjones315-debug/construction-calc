export type CalculatorCopyKey =
  | "concrete-slab"
  | "concrete-footing"
  | "concrete-block"
  | "concrete-block-wall";

export type InputLabelSet = {
  first: string;
  second: string;
  third: string;
};

export type CalculatorCopy = {
  key: CalculatorCopyKey;
  /**
   * Canonical path fragment used to match a calculator, e.g.
   * "/calculators/concrete/footing".
   */
  pathFragment: string;
  inputs: InputLabelSet;
};

export const CALCULATOR_COPY: CalculatorCopy[] = [
  {
    key: "concrete-slab",
    pathFragment: "/calculators/concrete/slab",
    inputs: {
      first: "Run Length (linear feet)",
      second: "Slab Width (ft)",
      third: "Slab Thickness (in)",
    },
  },
  {
    key: "concrete-footing",
    pathFragment: "/calculators/concrete/footing",
    inputs: {
      first: "Run Length (linear feet)",
      second: "Footing Width (ft)",
      third: "Footing Thickness / Depth (in)",
    },
  },
  {
    key: "concrete-block",
    pathFragment: "/calculators/concrete/block",
    inputs: {
      first: "Wall Run (linear feet)",
      second: "Wall Height (ft)",
      third: "Block Nominal Length (in)",
    },
  },
  {
    key: "concrete-block-wall",
    pathFragment: "/calculators/concrete/block-wall",
    inputs: {
      first: "Wall Run (linear feet)",
      second: "Wall Height (ft)",
      third: "Block Face Height (in)",
    },
  },
];

export function getConcreteInputLabelsFromCopy(path: string): InputLabelSet | null {
  const match = CALCULATOR_COPY.find((entry) => path.includes(entry.pathFragment));
  return match ? match.inputs : null;
}

