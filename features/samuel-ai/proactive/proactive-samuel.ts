export type SamuelInitiativePriority = "critical" | "high" | "medium" | "low";

export type SamuelInitiativeKind =
  | "calendar"
  | "email"
  | "lead"
  | "deployment"
  | "campaign"
  | "task"
  | "system";

export type SamuelInitiativeSignal = {
  id: string;
  kind: SamuelInitiativeKind;
  priority: SamuelInitiativePriority;
  title: string;
  detail?: string | null;
  source: string;
  actionLabel?: string;
  occurredAt?: string | null;
};

export type ProactiveSamuelGreetingInput = {
  userName?: string;
  companyName: string;
  urgentActions: number;
  pendingTasks: number;
  topPriority?: string | null;
  signals?: SamuelInitiativeSignal[];
  now?: Date;
};

export type ProactiveSamuelGreeting = {
  id: string;
  eyebrow: string;
  message: string;
  spokenMessage: string;
  sourceLabel: string;
  actionLabel: string | null;
  hasConcreteSignal: boolean;
  visualState: "resting" | "processing" | "alert";
  signal: SamuelInitiativeSignal | null;
};

const PRIORITY_WEIGHT: Record<SamuelInitiativePriority, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100,
};

const KIND_WEIGHT: Record<SamuelInitiativeKind, number> = {
  deployment: 70,
  calendar: 60,
  lead: 55,
  email: 50,
  campaign: 45,
  task: 40,
  system: 30,
};

function countLabel(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function compactText(value: string | null | undefined, maxLength = 150) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
    : normalized;
}

function sentence(value: string | null | undefined) {
  const compact = compactText(value);
  if (!compact) return null;
  return /[.!?…]$/.test(compact) ? compact : `${compact}.`;
}

function greetingForTime(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function signalScore(signal: SamuelInitiativeSignal) {
  const timestamp = signal.occurredAt ? Date.parse(signal.occurredAt) : Number.NaN;
  const recency = Number.isFinite(timestamp)
    ? Math.max(0, 20 - Math.floor((Date.now() - timestamp) / 3_600_000))
    : 0;
  return PRIORITY_WEIGHT[signal.priority] + KIND_WEIGHT[signal.kind] + recency;
}

function bestSignal(signals: SamuelInitiativeSignal[]) {
  return [...signals]
    .filter((signal) => Boolean(compactText(signal.title)))
    .sort((left, right) => {
      const scoreDifference = signalScore(right) - signalScore(left);
      return scoreDifference || left.id.localeCompare(right.id);
    })[0] ?? null;
}

function recommendationFor(signal: SamuelInitiativeSignal) {
  switch (signal.kind) {
    case "calendar":
      return "Recomendo preparar esse compromisso antes da próxima atividade.";
    case "email":
      return "Recomendo começar pelas mensagens com maior impacto executivo.";
    case "lead":
      return "Recomendo responder enquanto o interesse ainda está ativo.";
    case "deployment":
      return "Recomendo inspecionar o deploy e corrigir a causa antes de uma nova publicação.";
    case "campaign":
      return "Recomendo revisar desempenho, orçamento e segmentação antes do próximo ciclo.";
    case "system":
      return "Recomendo validar o serviço afetado antes de continuar a operação.";
    case "task":
    default:
      return "Recomendo tratar este ponto como a próxima prioridade executiva.";
  }
}

function fallbackSignal(input: ProactiveSamuelGreetingInput): SamuelInitiativeSignal | null {
  const urgentActions = Math.max(0, Math.round(input.urgentActions));
  const pendingTasks = Math.max(0, Math.round(input.pendingTasks));
  const priority = compactText(input.topPriority, 118);

  if (urgentActions > 0) {
    return {
      id: `runtime-urgent-${urgentActions}-${pendingTasks}-${priority ?? "sem-prioridade"}`,
      kind: "task",
      priority: "critical",
      title: `Identifiquei ${countLabel(urgentActions, "ação urgente", "ações urgentes")} e ${countLabel(pendingTasks, "tarefa pendente", "tarefas pendentes")}`,
      detail: priority ? `A prioridade mais relevante é ${priority}` : null,
      source: "monitorização executiva",
      actionLabel: "Rever prioridades",
    };
  }

  if (pendingTasks > 0) {
    return {
      id: `runtime-pending-${pendingTasks}-${priority ?? "sem-prioridade"}`,
      kind: "task",
      priority: "medium",
      title: `Não há alertas urgentes, mas existem ${countLabel(pendingTasks, "tarefa pendente", "tarefas pendentes")}`,
      detail: priority ? `A primeira prioridade é ${priority}` : null,
      source: "monitorização executiva",
      actionLabel: "Organizar tarefas",
    };
  }

  if (priority) {
    return {
      id: `runtime-priority-${priority}`,
      kind: "task",
      priority: "medium",
      title: `A prioridade atual é ${priority}`,
      source: "planeamento executivo",
      actionLabel: "Analisar prioridade",
    };
  }

  return null;
}

export function buildProactiveSamuelGreeting(input: ProactiveSamuelGreetingInput): ProactiveSamuelGreeting {
  const companyName = compactText(input.companyName, 80) ?? "sua empresa";
  const signal = bestSignal(input.signals ?? []) ?? fallbackSignal(input);
  const salutation = `${greetingForTime(input.now ?? new Date())}, senhor.`;

  if (!signal) {
    const message = `A monitorização da ${companyName} está ativa e, neste momento, nenhum evento real exige sua atenção.`;
    return {
      id: "monitoring-clear",
      eyebrow: "Monitorização ativa",
      message,
      spokenMessage: `${salutation} ${message}`,
      sourceLabel: "Samuel Runtime",
      actionLabel: null,
      hasConcreteSignal: false,
      visualState: "resting",
      signal: null,
    };
  }

  const title = sentence(signal.title) ?? "Identifiquei um evento relevante.";
  const detail = sentence(signal.detail);
  const message = [title, detail, recommendationFor(signal)].filter(Boolean).join(" ");

  return {
    id: `${signal.kind}:${signal.id}`,
    eyebrow: signal.priority === "critical" ? "Atenção executiva" : "Iniciativa do Samuel",
    message,
    spokenMessage: `${salutation} ${message}`,
    sourceLabel: signal.source,
    actionLabel: signal.actionLabel ?? "Analisar agora",
    hasConcreteSignal: true,
    visualState: signal.priority === "critical" ? "alert" : "processing",
    signal,
  };
}
