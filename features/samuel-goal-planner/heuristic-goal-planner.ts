import { DEFAULT_GOAL_PLAN_TEMPLATES } from "./goal-plan-templates";
import type {
  GoalPlan,
  GoalPlanner,
  GoalPlannerInput,
  GoalPlanPriority,
  GoalPlanTemplate,
} from "./types";

/**
 * Implementação heurística padrão do Goal Planner (Sprint 82).
 *
 * Determinística e testável, na mesma linha do Intent Router (Sprint 75) e
 * do Tool Planner (Sprint 80): nenhuma chamada de IA, nenhum efeito
 * colateral. Escolhe o template pela categoria já classificada pelo Intent
 * Router e calibra a prioridade geral do plano pela confiança da
 * classificação — nunca reclassifica a intenção nem altera seu resultado.
 */

const PRIORITY_ORDER: ReadonlyArray<GoalPlanPriority> = ["low", "medium", "high", "critical"];

/** Confiança baixa do Intent Router é um sinal de ambiguidade — reduz a prioridade em um nível, nunca abaixo de "low". */
function calibratePriority(basePriority: GoalPlanPriority, confidence: number): GoalPlanPriority {
  if (confidence >= 0.5) return basePriority;

  const index = PRIORITY_ORDER.indexOf(basePriority);
  return PRIORITY_ORDER[Math.max(0, index - 1)];
}

const FALLBACK_TEMPLATE: GoalPlanTemplate = DEFAULT_GOAL_PLAN_TEMPLATES.GENERAL_KNOWLEDGE;

export class HeuristicGoalPlanner implements GoalPlanner {
  private readonly templates: Readonly<Record<string, GoalPlanTemplate>>;

  constructor(templates: Readonly<Record<string, GoalPlanTemplate>> = DEFAULT_GOAL_PLAN_TEMPLATES) {
    this.templates = templates;
  }

  plan(input: GoalPlannerInput): GoalPlan {
    const template = this.templates[input.intentCategory] ?? FALLBACK_TEMPLATE;
    const priority = calibratePriority(template.basePriority, input.intentConfidence);

    return {
      finalObjective: template.finalObjectiveTemplate(input.query),
      priority,
      steps: template.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        dependsOn: step.dependsOn,
        priority: step.priority,
      })),
    };
  }
}

export function createGoalPlanner(
  templates?: Readonly<Record<string, GoalPlanTemplate>>,
): HeuristicGoalPlanner {
  return new HeuristicGoalPlanner(templates);
}
