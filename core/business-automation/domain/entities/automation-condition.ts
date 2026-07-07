import type { AutomationConditionId, AutomationWorkflowId, OrganizationId } from "../../shared";

export type ConditionOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than";

export type AutomationConditionProps = {
  id: AutomationConditionId;
  organizationId: OrganizationId;
  workflowId: AutomationWorkflowId;
  field: string;
  operator: ConditionOperator;
  value: string;
  logicalGroup?: string;
};

export class AutomationCondition {
  readonly id: AutomationConditionId;
  readonly organizationId: OrganizationId;
  readonly workflowId: AutomationWorkflowId;
  readonly field: string;
  readonly operator: ConditionOperator;
  readonly value: string;
  readonly logicalGroup?: string;

  private constructor(props: AutomationConditionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.workflowId = props.workflowId;
    this.field = props.field;
    this.operator = props.operator;
    this.value = props.value;
    this.logicalGroup = props.logicalGroup;
  }

  static create(
    props: Omit<AutomationConditionProps, "id"> & { id?: AutomationConditionId },
  ): AutomationCondition {
    return new AutomationCondition({
      id: props.id ?? `cond-${Date.now()}`,
      organizationId: props.organizationId,
      workflowId: props.workflowId,
      field: props.field.trim(),
      operator: props.operator,
      value: props.value,
      logicalGroup: props.logicalGroup,
    });
  }

  evaluate(context: Record<string, string>): boolean {
    const actual = context[this.field] ?? "";
    switch (this.operator) {
      case "equals":
        return actual === this.value;
      case "not_equals":
        return actual !== this.value;
      case "contains":
        return actual.includes(this.value);
      case "greater_than":
        return Number(actual) > Number(this.value);
      case "less_than":
        return Number(actual) < Number(this.value);
      default:
        return false;
    }
  }

  toJSON(): AutomationConditionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      workflowId: this.workflowId,
      field: this.field,
      operator: this.operator,
      value: this.value,
      logicalGroup: this.logicalGroup,
    };
  }
}
