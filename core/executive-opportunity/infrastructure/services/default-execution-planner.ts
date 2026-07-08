import { OpportunityExecutionPlan } from "../../domain";
import type { ExecutionPlanInput, ExecutionPlanOutput, ExecutionPlanner } from "../../domain";

export class DefaultExecutionPlanner implements ExecutionPlanner {
  plan(input: ExecutionPlanInput): ExecutionPlanOutput {
    const { opportunity, recommendations = [] } = input;
    const totalWeeks = opportunity.estimatedTime;

    const discoveryWeeks = Math.max(2, Math.round(totalWeeks * 0.2));
    const implementationWeeks = Math.max(4, Math.round(totalWeeks * 0.5));
    const rolloutWeeks = Math.max(2, totalWeeks - discoveryWeeks - implementationWeeks);

    const plan = OpportunityExecutionPlan.create({
      opportunityId: opportunity.id,
      phases: [
        {
          id: "phase-discovery",
          name: "Descoberta e Planeamento",
          durationWeeks: discoveryWeeks,
          deliverables: ["Requisitos validados", "Plano de projeto aprovado"],
          owner: opportunity.requiredDepartments[0],
        },
        {
          id: "phase-implementation",
          name: "Implementação",
          durationWeeks: implementationWeeks,
          deliverables: recommendations.slice(0, 3).length
            ? recommendations.slice(0, 3)
            : ["Solução implementada", "Testes concluídos"],
          owner: opportunity.requiredDepartments[1] ?? opportunity.requiredDepartments[0],
        },
        {
          id: "phase-rollout",
          name: "Rollout e Monitorização",
          durationWeeks: rolloutWeeks,
          deliverables: ["Go-live concluído", "KPIs monitorizados"],
          owner: "operations",
        },
      ],
      prerequisites: opportunity.dependencies.length
        ? opportunity.dependencies
        : ["Aprovação executiva", "Orçamento alocado"],
    });

    return { plan };
  }
}
