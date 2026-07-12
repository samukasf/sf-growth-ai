import type { IntentCategory } from "@/features/samuel-intent-router";

/**
 * Tipos públicos do Samuel Goal Planner (Sprint 82).
 *
 * O Goal Planner transforma o objetivo do usuário em um plano estruturado
 * ANTES de qualquer decisão ser tomada. Segue o mesmo princípio do Intent
 * Router (Sprint 75) e do Tool Planner (Sprint 80): é apenas planejamento —
 * nunca executa nenhuma ação, nunca chama IA, Company Brain, Executive
 * Council, Tool Orchestrator ou qualquer efeito colateral.
 */

export type GoalPlanPriority = "critical" | "high" | "medium" | "low";

/** Uma etapa do plano. `dependsOn` referencia `id`s de outras etapas do mesmo plano. */
export type GoalPlanStep = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** IDs de etapas que precisam ocorrer antes desta. Vazio = pode começar imediatamente. */
  readonly dependsOn: ReadonlyArray<string>;
  readonly priority: GoalPlanPriority;
};

/** Plano estruturado devolvido pelo Goal Planner: etapas, dependências, prioridade e objetivo final. */
export type GoalPlan = {
  readonly finalObjective: string;
  readonly steps: ReadonlyArray<GoalPlanStep>;
  readonly priority: GoalPlanPriority;
};

export type GoalPlannerInput = {
  readonly query: string;
  readonly intentCategory: IntentCategory;
  /** 0–1, vindo do Intent Router. Usado apenas para calibrar a prioridade geral do plano. */
  readonly intentConfidence: number;
};

/** Modelo imutável de etapas para uma categoria de intenção. Nunca é mutado após criado. */
export type GoalPlanStepTemplate = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly dependsOn: ReadonlyArray<string>;
  readonly priority: GoalPlanPriority;
};

export type GoalPlanTemplate = {
  readonly category: IntentCategory;
  readonly finalObjectiveTemplate: (query: string) => string;
  readonly steps: ReadonlyArray<GoalPlanStepTemplate>;
  readonly basePriority: GoalPlanPriority;
};

/** Contrato público do Goal Planner. Extensível: novas implementações podem substituir a heurística padrão. */
export interface GoalPlanner {
  plan(input: GoalPlannerInput): GoalPlan;
}
