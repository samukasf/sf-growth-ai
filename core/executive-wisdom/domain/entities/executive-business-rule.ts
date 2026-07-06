import type { BusinessRuleId, CompanyId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type BusinessRuleCondition = {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "contains";
  value: string | number;
};

export type ExecutiveBusinessRuleProps = {
  id: BusinessRuleId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  name: string;
  description: string;
  conditions: BusinessRuleCondition[];
  action: string;
  priority: Score;
  active: boolean;
  createdAt: string;
};

export class ExecutiveBusinessRule {
  readonly id: BusinessRuleId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly name: string;
  readonly description: string;
  readonly conditions: BusinessRuleCondition[];
  readonly action: string;
  readonly priority: Score;
  readonly active: boolean;
  readonly createdAt: string;

  private constructor(props: ExecutiveBusinessRuleProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.name = props.name;
    this.description = props.description;
    this.conditions = [...props.conditions];
    this.action = props.action;
    this.priority = props.priority;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveBusinessRuleProps, "id" | "createdAt" | "active"> & {
      id?: BusinessRuleId;
      createdAt?: string;
      active?: boolean;
    },
  ): ExecutiveBusinessRule {
    return new ExecutiveBusinessRule({
      id: props.id ?? `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      name: props.name.trim(),
      description: props.description.trim(),
      conditions: props.conditions,
      action: props.action.trim(),
      priority: clampScore(props.priority),
      active: props.active ?? true,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveBusinessRuleProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      name: this.name,
      description: this.description,
      conditions: [...this.conditions],
      action: this.action,
      priority: this.priority,
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
