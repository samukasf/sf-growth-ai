import type { ExecutiveDecision } from "./executive-decision.service";

export type ExecutionPlanStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "On Hold";

export type ExecutionStepStatus = "pending" | "in_progress" | "completed";

export type ExecutionStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  responsible: string;
  department: string;
  deadline: string;
  dependencies: string[];
  successIndicators: string[];
  risk: string;
  expectedImpact: string;
  status: ExecutionStepStatus;
};

export type ExecutionMilestone = {
  id: string;
  title: string;
  deadline: string;
  criteria: string;
};

export type ExecutionPhase = {
  id: string;
  order: number;
  title: string;
  description: string;
  deadline: string;
  steps: ExecutionStep[];
  milestones: ExecutionMilestone[];
};

export type ExecutionPlan = {
  id: string;
  decisionId: string;
  title: string;
  objective: string;
  department: string;
  deadline: string;
  phases: ExecutionPhase[];
  successIndicators: string[];
  risks: string[];
  expectedImpact: string;
  nextSteps: string[];
  progress: number;
  status: ExecutionPlanStatus;
};

const RESPONSIBLE_BY_DEPARTMENT: Record<string, string> = {
  Estratégia: "Samuel AI™ · Diretor Estratégico",
  Marketing: "Sophia · CMO",
  Comercial: "Lucas · Diretor Comercial",
  Operações: "Victor · COO",
  Financeiro: "Victor · CFO",
  TI: "Business Twin™ · Operações Digitais",
  Digital: "Sophia · Marketing Digital",
};

function parseDeadlineDays(deadline: string) {
  const match = deadline.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 30;
}

function formatPhaseDeadline(totalDays: number, ratio: number) {
  const days = Math.max(3, Math.round(totalDays * ratio));
  return `${days} dias`;
}

function getResponsible(department: string) {
  return RESPONSIBLE_BY_DEPARTMENT[department] ?? "Samuel AI™ · Executive Owner";
}

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildPlanRisks(decision: ExecutiveDecision) {
  const risks = [
    `Baixa aderência interna ao plano de ${decision.title.toLowerCase()}.`,
    `Atraso por dependências externas no prazo de ${decision.deadline}.`,
  ];

  if (decision.difficulty === "Alta") {
    risks.push("Complexidade elevada pode exigir recursos adicionais não previstos.");
  }

  if (decision.priority === "Critical") {
    risks.push("Impacto crítico em outras iniciativas se execução não iniciar em 7 dias.");
  }

  return risks;
}

function buildPlanIndicators(decision: ExecutiveDecision) {
  const indicators = [
    `ROI projetado: ${decision.estimatedROI}`,
    `Impacto em ${decision.impact} mensurável ao final do ciclo`,
    "Aprovação executiva do entregável principal",
  ];

  const normalized = normalizeText(decision.title);

  if (normalized.includes("posicionamento")) {
    indicators.push("Mensagem de posicionamento validada em 3 canais");
  }

  if (normalized.includes("website")) {
    indicators.push("Website publicado com taxa de conversão baseline");
  }

  if (normalized.includes("diferenciais") || normalized.includes("proposta")) {
    indicators.push("Playbook comercial atualizado com novos argumentos");
  }

  if (normalized.includes("memória") || normalized.includes("memoria")) {
    indicators.push("Mínimo de 5 memórias estratégicas registradas");
  }

  return indicators;
}

function buildObjective(decision: ExecutiveDecision) {
  return `Executar "${decision.title}" com foco em ${decision.impact}, entregando resultado mensurável em ${decision.deadline} e endereçando: ${decision.reason}`;
}

type PhaseBlueprint = {
  title: string;
  description: string;
  ratio: number;
  steps: Array<{
    title: string;
    description: string;
    ratio: number;
    dependencies?: string[];
    risk: string;
  }>;
  milestone: {
    title: string;
    criteria: string;
  };
};

const DEFAULT_PHASE_BLUEPRINTS: PhaseBlueprint[] = [
  {
    title: "Diagnóstico e Alinhamento",
    description: "Mapear estado atual, stakeholders e critérios de sucesso.",
    ratio: 0.25,
    steps: [
      {
        title: "Auditoria de baseline",
        description:
          "Levantar dados atuais, gaps e recursos disponíveis para a decisão.",
        ratio: 0.12,
        risk: "Dados incompletos podem distorcer priorização inicial.",
      },
      {
        title: "Alinhamento executivo",
        description:
          "Validar escopo, responsáveis e orçamento com liderança e área dona.",
        ratio: 0.13,
        dependencies: ["Auditoria de baseline"],
        risk: "Desalinhamento entre áreas pode atrasar kickoff.",
      },
    ],
    milestone: {
      title: "Kickoff aprovado",
      criteria: "Escopo, responsáveis e KPIs validados pela liderança.",
    },
  },
  {
    title: "Execução e Implementação",
    description: "Implementar entregáveis centrais da decisão executiva.",
    ratio: 0.5,
    steps: [
      {
        title: "Produção do entregável principal",
        description: "Executar ações core definidas na decisão executiva.",
        ratio: 0.3,
        dependencies: ["Alinhamento executivo"],
        risk: "Capacidade operacional limitada pode reduzir velocidade.",
      },
      {
        title: "Integração com operação",
        description:
          "Conectar entregável aos processos, canais e rotinas da empresa.",
        ratio: 0.2,
        dependencies: ["Produção do entregável principal"],
        risk: "Resistência operacional pode reduzir adoção.",
      },
    ],
    milestone: {
      title: "Entrega core concluída",
      criteria: "Entregável principal implementado e integrado à operação.",
    },
  },
  {
    title: "Validação e Escala",
    description: "Medir resultados, corrigir rotas e preparar expansão.",
    ratio: 0.25,
    steps: [
      {
        title: "Medição de performance",
        description: "Acompanhar KPIs, ROI e impacto esperado no período definido.",
        ratio: 0.12,
        dependencies: ["Integração com operação"],
        risk: "Indicadores sem baseline dificultam leitura de resultado.",
      },
      {
        title: "Plano de continuidade",
        description:
          "Documentar aprendizados e definir próximos ciclos de melhoria.",
        ratio: 0.13,
        dependencies: ["Medição de performance"],
        risk: "Sem continuidade, ganhos podem ser revertidos em 60 dias.",
      },
    ],
    milestone: {
      title: "Resultado validado",
      criteria: "KPIs atingidos e plano de continuidade aprovado.",
    },
  },
];

function buildPhases(decision: ExecutiveDecision): ExecutionPhase[] {
  const totalDays = parseDeadlineDays(decision.deadline);
  const responsible = getResponsible(decision.department);

  return DEFAULT_PHASE_BLUEPRINTS.map((blueprint, phaseIndex) => {
    const phaseId = `${decision.id}-phase-${phaseIndex + 1}`;
    const phaseDeadline = formatPhaseDeadline(totalDays, blueprint.ratio);

    const steps: ExecutionStep[] = blueprint.steps.map((stepBlueprint, stepIndex) => ({
      id: `${phaseId}-step-${stepIndex + 1}`,
      order: stepIndex + 1,
      title: stepBlueprint.title,
      description: `${stepBlueprint.description} Relacionado a: ${decision.title}.`,
      responsible,
      department: decision.department,
      deadline: formatPhaseDeadline(totalDays, stepBlueprint.ratio),
      dependencies: stepBlueprint.dependencies ?? [],
      successIndicators: [
        `Etapa concluída dentro de ${formatPhaseDeadline(totalDays, stepBlueprint.ratio)}`,
        `Contribuição direta para ${decision.impact}`,
      ],
      risk: stepBlueprint.risk,
      expectedImpact: decision.estimatedROI,
      status: "pending",
    }));

    const milestones: ExecutionMilestone[] = [
      {
        id: `${phaseId}-milestone-1`,
        title: blueprint.milestone.title,
        deadline: phaseDeadline,
        criteria: blueprint.milestone.criteria,
      },
    ];

    return {
      id: phaseId,
      order: phaseIndex + 1,
      title: blueprint.title,
      description: blueprint.description,
      deadline: phaseDeadline,
      steps,
      milestones,
    };
  });
}

function buildNextSteps(plan: Omit<ExecutionPlan, "nextSteps">): string[] {
  const firstPhase = plan.phases[0];
  const firstStep = firstPhase?.steps[0];

  if (!firstStep) {
    return ["Iniciar planejamento da execução"];
  }

  return [
    `Iniciar: ${firstStep.title}`,
    `Responsável: ${firstStep.responsible}`,
    `Prazo da etapa: ${firstStep.deadline}`,
    firstPhase.milestones[0]
      ? `Marco alvo: ${firstPhase.milestones[0].title}`
      : "Definir marco da fase 1",
  ];
}

function buildPlanForDecision(decision: ExecutiveDecision): ExecutionPlan {
  const phases = buildPhases(decision);
  const basePlan = {
    id: `plan-${decision.id}`,
    decisionId: decision.id,
    title: `Plano de Execução — ${decision.title}`,
    objective: buildObjective(decision),
    department: decision.department,
    deadline: decision.deadline,
    phases,
    successIndicators: buildPlanIndicators(decision),
    risks: buildPlanRisks(decision),
    expectedImpact: `${decision.impact} · ${decision.estimatedROI}`,
    progress: 0,
    status: "Not Started" as const,
  };

  return {
    ...basePlan,
    nextSteps: buildNextSteps(basePlan),
  };
}

export function buildExecutionPlan(
  decisions: ExecutiveDecision[],
): ExecutionPlan[] {
  return decisions.map(buildPlanForDecision);
}
