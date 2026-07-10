import { buildCompanyBrainFromDiscovery } from "./company-brain.builder";
import {
  createCompanyBrainRepository,
  getCompanyBrainRepository,
  type CompanyBrainRepository,
} from "./company-brain.repository";
import { applyScores, calculateScore } from "./company-brain.score";
import { summarizeCompanyBrain } from "./company-brain.summary";
import type {
  CompanyBrain,
  CompanyBrainBuildInput,
  CompanyBrainBuildResponse,
  CompanyBrainSummary,
  CompanyBrainUpdateInput,
  CompanyBrainValidationResult,
} from "./company-brain.types";
import { validateCompanyBrain } from "./company-brain.validator";

export class CompanyBrainService {
  constructor(private readonly repository: CompanyBrainRepository = getCompanyBrainRepository()) {}

  build(input: CompanyBrainBuildInput): Promise<CompanyBrainBuildResponse> {
    const brain = buildCompanyBrainFromDiscovery(input);
    return this.persistAndRespond(brain);
  }

  async update(id: string, input: CompanyBrainUpdateInput): Promise<CompanyBrainBuildResponse | null> {
    const updated = await this.repository.update(id, input);
    if (!updated) return null;

    const scored = applyScores(updated);
    await this.repository.save(scored);
    return this.toResponse(scored);
  }

  validate(brain: CompanyBrain): CompanyBrainValidationResult {
    return validateCompanyBrain(brain);
  }

  summarize(brain: CompanyBrain): CompanyBrainSummary {
    return summarizeCompanyBrain(brain);
  }

  calculateScore(brain: CompanyBrain) {
    return calculateScore(brain);
  }

  private async persistAndRespond(brain: CompanyBrain): Promise<CompanyBrainBuildResponse> {
    const saved = await this.repository.save(brain);
    return this.toResponse(saved);
  }

  private toResponse(brain: CompanyBrain): CompanyBrainBuildResponse {
    return {
      companyBrain: brain,
      summary: this.summarize(brain),
      validation: this.validate(brain),
    };
  }
}

let defaultService: CompanyBrainService | null = null;

export function getCompanyBrainService(): CompanyBrainService {
  if (!defaultService) {
    defaultService = new CompanyBrainService();
  }
  return defaultService;
}

export function createCompanyBrainService(
  repository?: CompanyBrainRepository,
): CompanyBrainService {
  return new CompanyBrainService(repository ?? createCompanyBrainRepository());
}

export async function buildCompanyBrain(
  input: CompanyBrainBuildInput,
): Promise<CompanyBrainBuildResponse> {
  return getCompanyBrainService().build(input);
}
