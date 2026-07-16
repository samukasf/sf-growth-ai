export type ProactiveSamuelGreetingInput = {
  userName?: string;
  companyName: string;
  urgentActions: number;
  pendingTasks: number;
  topPriority?: string | null;
};

export type ProactiveSamuelGreeting = {
  eyebrow: string;
  message: string;
  spokenMessage: string;
};

function countLabel(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function shortPriority(priority: string | null | undefined) {
  const normalized = priority?.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > 118
    ? `${normalized.slice(0, 115).trimEnd()}…`
    : normalized;
}

export function buildProactiveSamuelGreeting({
  userName = "Samuel",
  companyName,
  urgentActions,
  pendingTasks,
  topPriority,
}: ProactiveSamuelGreetingInput): ProactiveSamuelGreeting {
  const safeUrgentActions = Math.max(0, Math.round(urgentActions));
  const safePendingTasks = Math.max(0, Math.round(pendingTasks));
  const priority = shortPriority(topPriority);
  const introduction = `Olá, ${userName}. Eu sou o Samuel AI, seu assistente executivo.`;

  let signal: string;
  if (safeUrgentActions > 0) {
    signal = `Já analisei a ${companyName} e encontrei ${countLabel(
      safeUrgentActions,
      "ação urgente",
      "ações urgentes",
    )} e ${countLabel(safePendingTasks, "tarefa pendente", "tarefas pendentes")}.`;
  } else if (safePendingTasks > 0) {
    signal = `Já analisei a ${companyName}. Não há alertas urgentes, mas existem ${countLabel(
      safePendingTasks,
      "tarefa pendente",
      "tarefas pendentes",
    )}.`;
  } else {
    signal = `Já iniciei a leitura da ${companyName} e não encontrei pendências urgentes neste momento.`;
  }

  const recommendation = priority
    ? `Minha primeira recomendação é: ${priority}`
    : "Posso começar agora pela decisão mais importante do seu dia.";
  const message = `${signal} ${recommendation}`;

  return {
    eyebrow: "Samuel já começou",
    message,
    spokenMessage: `${introduction} ${message}`,
  };
}
