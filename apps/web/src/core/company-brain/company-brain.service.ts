import {
  buildCompanyBrain,
  updateCompanyBrainFromDiscovery,
} from "./company-brain.builder";
import { presentCompanyBrain } from "./company-brain.presenter";
import type { CompanyBrainRepository } from "./company-brain.repository";
import { getDefaultCompanyBrainRepository } from "./company-brain.repository";
import { applyScores, calculateScores } from "./company-brain.score";
import { summarizeCompanyBrain } from "./company-brain.summary";
import type {
  BuildCompanyBrainInput,
  CompanyBrain,
  CompanyBrainExecutiveSummary,
  CompanyBrainPresentation,
  CompanyBrainScores,
  CompanyBrainValidationResult,
  DiscoveryResult,
  UpdateCompanyBrainInput,
} from "./company-brain.types";
import { validateCompanyBrain } from "./company-brain.validator";

export class CompanyBrainService {
  constructor(private readonly repository: CompanyBrainRepository) {}

  async build(input: BuildCompanyBrainInput): Promise<CompanyBrain> {
    const brain = buildCompanyBrain(input.discovery);
    await this.repository.save(brain);
    return brain;
  }

  async update(input: UpdateCompanyBrainInput): Promise<CompanyBrain> {
    const existing = await this.repository.findById(input.brainId);
    if (!existing) {
      throw new Error(`Company Brain not found: ${input.brainId}`);
    }

    let next = existing;

    if (input.discovery) {
      next = updateCompanyBrainFromDiscovery(existing, input.discovery);
    }

    if (input.patch) {
      next = applyScores(
        {
          ...next,
          ...input.patch,
          updatedAt: new Date().toISOString(),
        },
        input.discovery,
      );
    } else if (input.discovery) {
      next = applyScores(next, input.discovery);
    }

    await this.repository.save(next);
    return next;
  }

  validate(brain: CompanyBrain): CompanyBrainValidationResult {
    return validateCompanyBrain(brain);
  }

  summarize(brain: CompanyBrain, discovery?: DiscoveryResult): CompanyBrainExecutiveSummary {
    return summarizeCompanyBrain(brain, discovery);
  }

  calculateScore(brain: CompanyBrain, discovery?: DiscoveryResult): CompanyBrainScores {
    return calculateScores(brain, discovery);
  }

  present(brain: CompanyBrain, discovery?: DiscoveryResult): CompanyBrainPresentation {
    return presentCompanyBrain(brain, discovery);
  }

  async getById(id: string): Promise<CompanyBrain | null> {
    return this.repository.findById(id);
  }

  async getByCompanyId(companyId: string): Promise<CompanyBrain | null> {
    return this.repository.findByCompanyId(companyId);
  }
}

let defaultService: CompanyBrainService | null = null;

export function getCompanyBrainService(): CompanyBrainService {
  if (!defaultService) {
    defaultService = new CompanyBrainService(getDefaultCompanyBrainRepository());
  }
  return defaultService;
}
