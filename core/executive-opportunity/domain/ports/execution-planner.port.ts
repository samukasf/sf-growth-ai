import type { BusinessOpportunity, OpportunityExecutionPlan } from "../entities";

export type ExecutionPlanInput = {
  opportunity: BusinessOpportunity;
  recommendations?: string[];
};

export type ExecutionPlanOutput = {
  plan: OpportunityExecutionPlan;
};

export interface ExecutionPlanner {
  plan(input: ExecutionPlanInput): ExecutionPlanOutput;
}
