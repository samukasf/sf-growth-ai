import type {
  AutomationOpportunityId,
  CompanyId,
  InnovationOpportunityId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type AutomationOpportunityProps = {
  id: AutomationOpportunityId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  processName: string;
  manualSteps: string[];
  automationPotential: Score;
  estimatedTimeSavedHours: number;
  description: string;
};

export class AutomationOpportunity {
  readonly id: AutomationOpportunityId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly processName: string;
  readonly manualSteps: string[];
  readonly automationPotential: Score;
  readonly estimatedTimeSavedHours: number;
  readonly description: string;

  private constructor(props: AutomationOpportunityProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.processName = props.processName;
    this.manualSteps = [...props.manualSteps];
    this.automationPotential = props.automationPotential;
    this.estimatedTimeSavedHours = props.estimatedTimeSavedHours;
    this.description = props.description;
  }

  static create(
    props: Omit<AutomationOpportunityProps, "id"> & { id?: AutomationOpportunityId },
  ): AutomationOpportunity {
    return new AutomationOpportunity({
      id: props.id ?? `automation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      processName: props.processName.trim(),
      manualSteps: props.manualSteps,
      automationPotential: clampScore(props.automationPotential),
      estimatedTimeSavedHours: Math.max(0, props.estimatedTimeSavedHours),
      description: props.description.trim(),
    });
  }

  toJSON(): AutomationOpportunityProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      processName: this.processName,
      manualSteps: [...this.manualSteps],
      automationPotential: this.automationPotential,
      estimatedTimeSavedHours: this.estimatedTimeSavedHours,
      description: this.description,
    };
  }
}
