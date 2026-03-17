/**
 * Calculate staggered stud wall framing quantities
 * Uses integer math for precise material counts
 */

export type StaggeredStudInput = {
  wallLengthFeet: number;
  studSpacingInches: number;
  studHeightFeet: number;
  isStaggered: boolean;
};

export type StaggeredStudResult = {
  studCount: number;
  plateLengthFeet: number;
  totalStuds: number;
};

/**
 * Calculate stud quantities for standard or staggered wall framing
 * For staggered walls, uses formula: Studs = (Wall Length / OC Spacing + 1) × 2
 */
export function calculateStaggeredStuds(
  input: StaggeredStudInput,
): StaggeredStudResult {
  // Convert feet to inches for integer math
  const wallLengthInches = Math.round(input.wallLengthFeet * 12);

  // Calculate base stud count using integer division with ceiling
  const baseStudCount =
    Math.ceil(wallLengthInches / input.studSpacingInches) + 1;

  // Double stud count for staggered walls
  const totalStuds = input.isStaggered ? baseStudCount * 2 : baseStudCount;

  return {
    studCount: totalStuds,
    plateLengthFeet: input.wallLengthFeet,
    totalStuds: totalStuds + 3, // Add 3 for end studs and king stud
  };
}
