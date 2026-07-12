import type { GoalPlanTemplate } from "./types";

/**
 * Templates imutáveis de plano por categoria de intenção (Sprint 82).
 *
 * Cada template é um objeto congelado (`Object.freeze`), nunca um registro
 * mutável global — a mesma regra aplicada às regras linguísticas do Intent
 * Router (Sprint 75). São injetados no `HeuristicGoalPlanner`, nunca lidos de
 * um singleton compartilhado que possa ser alterado em runtime.
 *
 * As etapas modelam uma cadeia de dependências linear e conservadora
 * (etapa N depende da etapa N-1) — suficiente para observabilidade nesta
 * sprint, sem inventar paralelismo que o restante do pipeline não usa.
 */

function buildTemplate(template: GoalPlanTemplate): GoalPlanTemplate {
  return Object.freeze({
    ...template,
    steps: Object.freeze(template.steps.map((step) => Object.freeze({ ...step }))),
  });
}

export const BUSINESS_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "BUSINESS",
  finalObjectiveTemplate: (query) => `Atender à solicitação de negócio: "${query}".`,
  basePriority: "high",
  steps: [
    {
      id: "understand-business-request",
      title: "Entender a solicitação de negócio",
      description: "Identificar o objetivo de negócio implícito na pergunta do usuário.",
      dependsOn: [],
      priority: "high",
    },
    {
      id: "gather-company-context",
      title: "Reunir contexto da empresa",
      description: "Levantar dados relevantes da empresa para fundamentar a resposta.",
      dependsOn: ["understand-business-request"],
      priority: "high",
    },
    {
      id: "draft-business-plan",
      title: "Estruturar plano de ação",
      description: "Organizar as etapas necessárias para atingir o objetivo de negócio.",
      dependsOn: ["gather-company-context"],
      priority: "medium",
    },
  ],
});

export const GENERAL_KNOWLEDGE_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "GENERAL_KNOWLEDGE",
  finalObjectiveTemplate: (query) => `Responder à pergunta de conhecimento geral: "${query}".`,
  basePriority: "low",
  steps: [
    {
      id: "interpret-question",
      title: "Interpretar a pergunta",
      description: "Entender exatamente o que está sendo perguntado.",
      dependsOn: [],
      priority: "low",
    },
    {
      id: "answer-directly",
      title: "Responder diretamente",
      description: "Formular a resposta sem necessidade de contexto de negócio.",
      dependsOn: ["interpret-question"],
      priority: "low",
    },
  ],
});

export const HYBRID_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "HYBRID",
  finalObjectiveTemplate: (query) =>
    `Explicar o conceito e aplicá-lo ao contexto da empresa: "${query}".`,
  basePriority: "high",
  steps: [
    {
      id: "explain-concept",
      title: "Explicar o conceito geral",
      description: "Fornecer a explicação de conhecimento geral solicitada.",
      dependsOn: [],
      priority: "medium",
    },
    {
      id: "gather-company-context-hybrid",
      title: "Reunir contexto da empresa",
      description: "Levantar dados da empresa para conectar o conceito à realidade do negócio.",
      dependsOn: ["explain-concept"],
      priority: "high",
    },
    {
      id: "apply-to-company",
      title: "Aplicar o conceito à empresa",
      description: "Conectar a explicação geral às particularidades da empresa do usuário.",
      dependsOn: ["gather-company-context-hybrid"],
      priority: "high",
    },
  ],
});

export const AUTOMATION_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "AUTOMATION",
  finalObjectiveTemplate: (query) => `Planejar a automação solicitada: "${query}".`,
  basePriority: "high",
  steps: [
    {
      id: "identify-automation-target",
      title: "Identificar o que deve ser automatizado",
      description: "Determinar a tarefa repetitiva ou processo que o usuário quer automatizar.",
      dependsOn: [],
      priority: "high",
    },
    {
      id: "check-available-tools",
      title: "Verificar ferramentas disponíveis",
      description: "Avaliar quais ferramentas do Tool Orchestrator poderiam apoiar a automação.",
      dependsOn: ["identify-automation-target"],
      priority: "high",
    },
    {
      id: "outline-automation-steps",
      title: "Delinear as etapas da automação",
      description: "Organizar a sequência necessária para executar a automação com segurança.",
      dependsOn: ["check-available-tools"],
      priority: "critical",
    },
  ],
});

export const ANALYSIS_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "ANALYSIS",
  finalObjectiveTemplate: (query) => `Produzir a análise solicitada: "${query}".`,
  basePriority: "critical",
  steps: [
    {
      id: "define-analysis-scope",
      title: "Definir o escopo da análise",
      description: "Delimitar exatamente o que precisa ser analisado.",
      dependsOn: [],
      priority: "high",
    },
    {
      id: "collect-analysis-data",
      title: "Coletar dados relevantes",
      description: "Reunir os dados da empresa necessários para a análise.",
      dependsOn: ["define-analysis-scope"],
      priority: "critical",
    },
    {
      id: "synthesize-findings",
      title: "Sintetizar achados",
      description: "Consolidar os dados coletados em conclusões claras.",
      dependsOn: ["collect-analysis-data"],
      priority: "critical",
    },
  ],
});

export const CREATION_GOAL_PLAN_TEMPLATE: GoalPlanTemplate = buildTemplate({
  category: "CREATION",
  finalObjectiveTemplate: (query) => `Criar o artefato solicitado: "${query}".`,
  basePriority: "high",
  steps: [
    {
      id: "clarify-creation-requirements",
      title: "Esclarecer requisitos da criação",
      description: "Entender o que exatamente deve ser criado e para qual finalidade.",
      dependsOn: [],
      priority: "medium",
    },
    {
      id: "structure-creation-plan",
      title: "Estruturar o plano de criação",
      description: "Organizar as etapas necessárias para produzir o artefato solicitado.",
      dependsOn: ["clarify-creation-requirements"],
      priority: "high",
    },
  ],
});

/** Mapa imutável categoria → template. Injetado no planner, nunca mutado. */
export const DEFAULT_GOAL_PLAN_TEMPLATES: Readonly<Record<string, GoalPlanTemplate>> = Object.freeze({
  BUSINESS: BUSINESS_GOAL_PLAN_TEMPLATE,
  GENERAL_KNOWLEDGE: GENERAL_KNOWLEDGE_GOAL_PLAN_TEMPLATE,
  HYBRID: HYBRID_GOAL_PLAN_TEMPLATE,
  AUTOMATION: AUTOMATION_GOAL_PLAN_TEMPLATE,
  ANALYSIS: ANALYSIS_GOAL_PLAN_TEMPLATE,
  CREATION: CREATION_GOAL_PLAN_TEMPLATE,
});
