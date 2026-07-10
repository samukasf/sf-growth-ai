import { runCompanyAnalysisPipeline } from "./company-analysis.pipeline";
import type { CompanyAnalysisInput, CompanyAnalysisRuntimeResponse } from "./company-analysis.types";

export class CompanyAnalysisService {
  analyze(input: CompanyAnalysisInput): Promise<CompanyAnalysisRuntimeResponse> {
    if (!input.companyName?.trim()) {
      return Promise.reject(new Error("companyName is required"));
    }
    return runCompanyAnalysisPipeline(input);
  }
}

let defaultService: CompanyAnalysisService | null = null;

export function getCompanyAnalysisService(): CompanyAnalysisService {
  if (!defaultService) {
    defaultService = new CompanyAnalysisService();
  }
  return defaultService;
}

export async function analyzeCompany(
  input: CompanyAnalysisInput,
): Promise<CompanyAnalysisRuntimeResponse> {
  return getCompanyAnalysisService().analyze(input);
}
