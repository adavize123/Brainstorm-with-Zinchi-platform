// Maps a mock exam's raw performance (score / totalMarks) onto the real
// published score scale for that standardized test, and assigns a plain-
// language grade band.
//
// IMPORTANT: Real exams (SAT, GRE, GMAT, TOEFL...) use proprietary, non-linear
// equating tables to convert raw answers into a scaled score — those tables
// aren't public and vary by test administration. What's implemented here is
// a transparent *linear estimate*: the student's percentage correct is
// mapped onto that exam's real min–max range. It is deliberately labeled
// "Estimated Score" everywhere it's shown, so it's useful for practice
// tracking without pretending to be an official score predictor.

export type ExamType = "SAT" | "IELTS" | "TOEFL" | "GRE" | "GMAT" | "PTE" | "DUOLINGO" | "GENERAL";

export interface ExamStandard {
  value: ExamType;
  label: string;
  min: number;
  max: number;
  step: number;
  /** How to render a scaled value, e.g. (7.5) => "7.5 Bands" */
  format: (value: number) => string;
}

export const EXAM_STANDARDS: Record<ExamType, ExamStandard> = {
  SAT: {
    value: "SAT",
    label: "SAT",
    min: 400,
    max: 1600,
    step: 10,
    format: (v) => `${v}`,
  },
  IELTS: {
    value: "IELTS",
    label: "IELTS",
    min: 0,
    max: 9,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} Bands`,
  },
  TOEFL: {
    value: "TOEFL",
    label: "TOEFL iBT",
    min: 0,
    max: 120,
    step: 1,
    format: (v) => `${v}`,
  },
  GRE: {
    value: "GRE",
    label: "GRE",
    min: 260,
    max: 340,
    step: 1,
    format: (v) => `${v}`,
  },
  GMAT: {
    value: "GMAT",
    label: "GMAT",
    min: 205,
    max: 805,
    step: 10,
    format: (v) => `${v}`,
  },
  PTE: {
    value: "PTE",
    label: "PTE Academic",
    min: 10,
    max: 90,
    step: 1,
    format: (v) => `${v}`,
  },
  DUOLINGO: {
    value: "DUOLINGO",
    label: "Duolingo English Test",
    min: 10,
    max: 160,
    step: 5,
    format: (v) => `${v}`,
  },
  GENERAL: {
    value: "GENERAL",
    label: "General / Custom",
    min: 0,
    max: 100,
    step: 1,
    format: (v) => `${v}%`,
  },
};

export const EXAM_TYPE_OPTIONS = Object.values(EXAM_STANDARDS);

export function isExamType(value: string): value is ExamType {
  return value in EXAM_STANDARDS;
}

export interface GradeBand {
  label: string;
  variant: "success" | "default" | "warning" | "destructive";
}

export function gradeForPercentage(percentage: number): GradeBand {
  if (percentage >= 85) return { label: "Excellent", variant: "success" };
  if (percentage >= 70) return { label: "Good", variant: "default" };
  if (percentage >= 50) return { label: "Fair", variant: "warning" };
  return { label: "Needs Improvement", variant: "destructive" };
}

export interface ExamResult {
  percentage: number;
  scaledScore: number;
  scaledDisplay: string;
  maxScaledDisplay: string;
  standard: ExamStandard;
  grade: GradeBand;
}

/** Rounds `value` to the nearest multiple of `step`. */
function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function computeExamResult(score: number, totalMarks: number, examType: string): ExamResult {
  const standard = EXAM_STANDARDS[isExamType(examType) ? examType : "GENERAL"];
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const rawScaled = standard.min + (percentage / 100) * (standard.max - standard.min);
  const scaledScore = roundToStep(rawScaled, standard.step);

  return {
    percentage,
    scaledScore,
    scaledDisplay: standard.format(scaledScore),
    maxScaledDisplay: standard.format(standard.max),
    standard,
    grade: gradeForPercentage(percentage),
  };
}
