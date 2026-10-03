export type SamuelMissionStatus =
  | "planning"
  | "running"
  | "waiting_approval"
  | "completed"
  | "partial"
  | "blocked";

export type SamuelMissionStepStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "delegated"
  | "completed"
  | "blocked";

export type SamuelMissionStep = {
  id: string;
  skillId: string;
  title: string;
  detail: string;
  status: SamuelMissionStepStatus;
  risk: "read" | "write" | "sensitive";
  requiresApproval: boolean;
  capabilityId: string | null;
  evidence?: string | null;
};

export type SamuelMission = {
  id: string;
  objective: string;
  status: SamuelMissionStatus;
  createdAt: string;
  steps: SamuelMissionStep[];
};

type PlannedSkill = {
  id: string;
  name: string;
  risk: "read" | "write" | "sensitive";
};

type StepTemplate = Omit<
  SamuelMissionStep,
  "id" | "status" | "evidence"
> & {
  dedupeKey: string;
};

const LEAD_DISCOVERY_PATTERN =
  /(?:encontr|procure|buscar|busque|lista|localiz).{0,40}(?:empresa|lead|cliente|restaurante|hotel|neg[oó]cio|loja|prestador)/i;

const SITE_CREATION_PATTERN =
  /(?:cri|fa[çc]|mont|constru).{0,24}(?:site|website|landing|p[aá]gina|mini-?app|aplicativo)/i;

const STEP_BY_SKILL: Record<string, StepTemplate> = {
  memory: {
    dedupeKey: "memory",
    skillId: "memory",
    title: "Recuperar contexto relevante",
    detail: "Usar memória e histórico da empresa antes de decidir ou executar.",
    risk: "read",
    requiresApproval: false,
    capabilityId: null,
  },
  "live-web": {
    dedupeKey: "research",
    skillId: "live-web",
    title: "Pesquisar e validar dados atuais",
    detail: "Consultar fontes em tempo real e separar fatos verificados de inferências.",
    risk: "read",
    requiresApproval: false,
    capabilityId: "research.company",
  },
  research: {
    dedupeKey: "research",
    skillId: "research",
    title: "Pesquisar e consolidar evidências",
    detail: "Reunir dados verificáveis antes de formular a resposta ou executar próximos passos.",
    risk: "read",
    requiresApproval: false,
    capabilityId: "research.company",
  },
  gmail: {
    dedupeKey: "gmail",
    skillId: "gmail",
    title: "Trabalhar no Gmail",
    detail: "Ler, preparar ou executar a ação de e-mail pedida, exigindo aprovação quando houver alteração externa.",
    risk: "write",
    requiresApproval: true,
    capabilityId: "workspace.email",
  },
  calendar: {
    dedupeKey: "calendar",
    skillId: "calendar",
    title: "Trabalhar na Agenda",
    detail: "Consultar ou preparar alterações no calendário, com aprovação antes de mudanças externas.",
    risk: "write",
    requiresApproval: true,
    capabilityId: "workspace.calendar",
  },
  desktop: {
    dedupeKey: "desktop",
    skillId: "desktop",
    title: "Executar no computador",
    detail: "Delegar a tarefa ao Samuel Desktop e validar a execução por evidência visual.",
    risk: "sensitive",
    requiresApproval: true,
    capabilityId: "desktop.computer",
  },
  music: {
    dedupeKey: "music",
    skillId: "music",
    title: "Controlar música",
    detail: "Executar o comando no Spotify Connect ou no player de fallback.",
    risk: "read",
    requiresApproval: false,
    capabilityId: "media.music",
  },
  content: {
    dedupeKey: "content",
    skillId: "content",
    title: "Produzir conteúdo",
    detail: "Criar o projeto no Studio e encaminhar vídeo, narração ou social conforme o pedido.",
    risk: "write",
    requiresApproval: false,
    capabilityId: "creative.video",
  },
  "site-builder": {
    dedupeKey: "site-builder",
    skillId: "site-builder",
    title: "Criar site ou aplicação",
    detail: "Transformar o pedido em briefing e abrir o construtor com o contexto já preenchido.",
    risk: "write",
    requiresApproval: false,
    capabilityId: "creative.website",
  },
  crm: {
    dedupeKey: "crm",
    skillId: "crm",
    title: "Atualizar fluxo comercial",
    detail: "Organizar leads, clientes e oportunidades sem perder a trilha de execução.",
    risk: "write",
    requiresApproval: false,
    capabilityId: "sales.crm",
  },
  marketing: {
    dedupeKey: "marketing",
    skillId: "marketing",
    title: "Analisar marketing e campanhas",
    detail: "Consultar integrações e métricas disponíveis antes de recomendar alterações.",
    risk: "read",
    requiresApproval: false,
    capabilityId: "growth.ads-analysis",
  },
};

function fallbackStep(skill: PlannedSkill): StepTemplate {
  return {
    dedupeKey: skill.id,
    skillId: skill.id,
    title: skill.name,
    detail: "Executar a capacidade identificada para este pedido.",
    risk: skill.risk,
    requiresApproval: skill.risk !== "read",
    capabilityId: null,
  };
}

function missionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function shouldDiscoverLocalBusinesses(query: string) {
  return LEAD_DISCOVERY_PATTERN.test(query);
}

export function shouldOpenSiteBuilder(query: string) {
  return SITE_CREATION_PATTERN.test(query);
}

export function buildSamuelMission(
  objective: string,
  skills: readonly PlannedSkill[],
  now = new Date(),
): SamuelMission {
  const templates: StepTemplate[] = [];

  if (shouldDiscoverLocalBusinesses(objective)) {
    templates.push({
      dedupeKey: "lead-discovery",
      skillId: "lead-discovery",
      title: "Descobrir empresas reais",
      detail: "Pesquisar negócios no Google Places e preservar nome, endereço, telefone, site e origem.",
      risk: "read",
      requiresApproval: false,
      capabilityId: "growth.lead-discovery",
    });
  }

  for (const skill of skills) {
    if (skill.id === "conversation") continue;
    const template = STEP_BY_SKILL[skill.id] ?? fallbackStep(skill);
    if (!templates.some((item) => item.dedupeKey === template.dedupeKey)) {
      templates.push(template);
    }
  }

  if (shouldOpenSiteBuilder(objective) && !templates.some((item) => item.dedupeKey === "site-builder")) {
    templates.push(STEP_BY_SKILL["site-builder"]);
  }

  if (!templates.length) {
    templates.push({
      dedupeKey: "answer",
      skillId: "conversation",
      title: "Entender e responder",
      detail: "Interpretar o objetivo, usar o contexto disponível e entregar a próxima ação útil.",
      risk: "read",
      requiresApproval: false,
      capabilityId: null,
    });
  }

  return {
    id: missionId(),
    objective: objective.trim(),
    status: "running",
    createdAt: now.toISOString(),
    steps: templates.map((template, index) => ({
      id: `${template.dedupeKey}-${index + 1}`,
      skillId: template.skillId,
      title: template.title,
      detail: template.detail,
      status: "queued",
      risk: template.risk,
      requiresApproval: template.requiresApproval,
      capabilityId: template.capabilityId,
      evidence: null,
    })),
  };
}

export function updateSamuelMissionStep(
  mission: SamuelMission,
  skillId: string,
  patch: Pick<SamuelMissionStep, "status"> & Partial<Pick<SamuelMissionStep, "evidence" | "detail">>,
): SamuelMission {
  let changed = false;
  const steps = mission.steps.map((step) => {
    if (step.skillId !== skillId && step.capabilityId !== skillId) return step;
    changed = true;
    return { ...step, ...patch };
  });
  if (!changed) return mission;

  const waiting = steps.some((step) => step.status === "waiting_approval");
  const active = steps.some((step) => ["queued", "running", "delegated"].includes(step.status));
  const blocked = steps.some((step) => step.status === "blocked");
  const completed = steps.every((step) => step.status === "completed");

  return {
    ...mission,
    steps,
    status: completed
      ? "completed"
      : waiting
        ? "waiting_approval"
        : active
          ? "running"
          : blocked
            ? "partial"
            : mission.status,
  };
}

export function finalizeSamuelMission(mission: SamuelMission): SamuelMission {
  const steps = mission.steps.map((step) => {
    if (step.status !== "queued") return step;
    if (step.skillId === "conversation" || step.skillId === "memory") {
      return {
        ...step,
        status: "completed" as const,
        evidence: step.evidence ?? "Concluído pelo Samuel Runtime com o contexto disponível.",
      };
    }
    return {
      ...step,
      status: "blocked" as const,
      evidence:
        step.evidence ??
        "Capacidade identificada, mas não foi acionada por um executor verificado nesta execução.",
    };
  });

  const blocked = steps.some((step) => step.status === "blocked");
  const waiting = steps.some((step) => step.status === "waiting_approval");
  const active = steps.some((step) => ["running", "delegated"].includes(step.status));

  return {
    ...mission,
    steps,
    status: waiting
      ? "waiting_approval"
      : active
        ? "running"
        : blocked
          ? "partial"
          : "completed",
  };
}
