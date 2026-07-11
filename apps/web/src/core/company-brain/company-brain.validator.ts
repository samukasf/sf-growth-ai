import type {
  CompanyBrain,
  CompanyBrainValidationIssue,
  CompanyBrainValidationResult,
} from "./company-brain.types";

const REQUIRED_TEXT_FIELDS: Array<{ field: keyof CompanyBrain; label: string }> = [
  { field: "mission", label: "Mission" },
  { field: "vision", label: "Vision" },
];

const REQUIRED_LIST_FIELDS: Array<{ field: keyof CompanyBrain; label: string }> = [
  { field: "values", label: "Values" },
  { field: "products", label: "Products" },
  { field: "services", label: "Services" },
  { field: "targetAudience", label: "Target Audience" },
  { field: "businessGoals", label: "Business Goals" },
];

export function validateCompanyBrain(brain: CompanyBrain): CompanyBrainValidationResult {
  const issues: CompanyBrainValidationIssue[] = [];

  for (const { field, label } of REQUIRED_TEXT_FIELDS) {
    const value = brain[field];
    if (typeof value !== "string" || !value.trim()) {
      issues.push({
        field: String(field),
        message: `${label} is required`,
        severity: "error",
      });
    }
  }

  for (const { field, label } of REQUIRED_LIST_FIELDS) {
    const value = brain[field];
    if (!Array.isArray(value) || value.length === 0) {
      issues.push({
        field: String(field),
        message: `${label} must contain at least one item`,
        severity: "warning",
      });
    }
  }

  const swotFields: Array<keyof CompanyBrain["swot"]> = [
    "strengths",
    "weaknesses",
    "opportunities",
    "threats",
  ];

  for (const field of swotFields) {
    if (brain.swot[field].length === 0) {
      issues.push({
        field: `swot.${field}`,
        message: `SWOT ${field} is empty`,
        severity: "warning",
      });
    }
  }

  if (brain.knowledgeScore < 40) {
    issues.push({
      field: "knowledgeScore",
      message: "Knowledge score is below recommended threshold (40)",
      severity: "warning",
    });
  }

  if (brain.completenessScore < 50) {
    issues.push({
      field: "completenessScore",
      message: "Completeness score is below recommended threshold (50)",
      severity: "warning",
    });
  }

  const hasErrors = issues.some((issue) => issue.severity === "error");

  return {
    valid: !hasErrors,
    issues,
  };
}
