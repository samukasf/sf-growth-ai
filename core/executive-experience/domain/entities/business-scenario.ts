import type { BusinessScenarioId, CompanyId, ExperienceId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type BusinessScenarioProps = {
  id: BusinessScenarioId;
  companyId: CompanyId;
  experienceId?: ExperienceId;
  title: string;
  description: string;
  domain: string;
  complexity: Score;
  matchedAt: string;
};

export class BusinessScenario {
  readonly id: BusinessScenarioId;
  readonly companyId: CompanyId;
  readonly experienceId?: ExperienceId;
  readonly title: string;
  readonly description: string;
  readonly domain: string;
  readonly complexity: Score;
  readonly matchedAt: string;

  private constructor(props: BusinessScenarioProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.experienceId = props.experienceId;
    this.title = props.title;
    this.description = props.description;
    this.domain = props.domain;
    this.complexity = props.complexity;
    this.matchedAt = props.matchedAt;
  }

  static create(
    props: Omit<BusinessScenarioProps, "id" | "matchedAt"> & {
      id?: BusinessScenarioId;
      matchedAt?: string;
    },
  ): BusinessScenario {
    return new BusinessScenario({
      id: props.id ?? `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      experienceId: props.experienceId,
      title: props.title.trim(),
      description: props.description.trim(),
      domain: props.domain.trim(),
      complexity: clampScore(props.complexity),
      matchedAt: props.matchedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): BusinessScenarioProps {
    return {
      id: this.id,
      companyId: this.companyId,
      experienceId: this.experienceId,
      title: this.title,
      description: this.description,
      domain: this.domain,
      complexity: this.complexity,
      matchedAt: this.matchedAt,
    };
  }
}
