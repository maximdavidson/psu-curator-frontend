export const StudentFundingType = {
  Budget: 0,
  Contract: 1
} as const;

export type StudentFundingTypeValue =
  (typeof StudentFundingType)[keyof typeof StudentFundingType];

export const STUDENT_FUNDING_LABELS: Record<StudentFundingTypeValue, string> = {
  [StudentFundingType.Budget]: "Бюджет",
  [StudentFundingType.Contract]: "Платник"
};

export function getStudentFundingLabel(
  fundingType: StudentFundingTypeValue | number | null | undefined
): string | null {
  if (fundingType === null || fundingType === undefined) {
    return null;
  }

  return STUDENT_FUNDING_LABELS[fundingType as StudentFundingTypeValue] ?? null;
}
