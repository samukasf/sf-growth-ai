import type { MultiToolTaskPlan, MultiToolTaskStepPlan } from "./types";

const MEETING_INVITE_PATTERN =
  /(?:marque|agende).*(?:reuni[aã]o|compromisso).*(?:\s+e\s+)(?:envie|mande|enviar).*(?:e-?mail|convite)/i;

function parseContactName(query: string): string {
  const withMatch = query.match(/\bcom\s+([A-Za-zÀ-ÿ]+)/i);
  return withMatch?.[1]?.trim() || "Convidado";
}

function parseMeetingSchedule(query: string, contactName: string): {
  title: string;
  start: string;
  end: string;
} {
  const start = new Date();

  if (/sexta/i.test(query)) {
    const day = start.getDay();
    const daysUntilFriday = ((5 - day + 7) % 7) || 7;
    start.setDate(start.getDate() + daysUntilFriday);
  } else if (/amanh[aã]/i.test(query)) {
    start.setDate(start.getDate() + 1);
  }

  const hourMatch = query.match(/(?:às|as)\s*(\d{1,2})(?:[:h](\d{2}))?/i);
  const hour = hourMatch ? Number.parseInt(hourMatch[1], 10) : 10;
  const minute = hourMatch?.[2] ? Number.parseInt(hourMatch[2], 10) : 0;
  start.setHours(hour, minute, 0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    title: `Reunião com ${contactName}`,
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function planMeetingInviteTask(query: string): MultiToolTaskStepPlan[] {
  const contactName = parseContactName(query);
  const schedule = parseMeetingSchedule(query, contactName);

  return [
    {
      id: "contacts",
      toolName: "google-contacts",
      input: { actionId: "contacts_email", name: contactName },
      reason: `Buscar e-mail de ${contactName} nos contatos Google.`,
    },
    {
      id: "calendar",
      toolName: "google-calendar",
      input: {
        actionId: "calendar_create",
        title: schedule.title,
        start: schedule.start,
        end: schedule.end,
      },
      reason: "Criar evento no Google Calendar com horário solicitado.",
    },
    {
      id: "gmail",
      toolName: "gmail",
      input: { actionId: "reply_message", body: "Convite de reunião." },
      reason: "Enviar convite por e-mail com dados do contato e do evento.",
      dependsOn: ["contacts"],
    },
  ];
}

/**
 * Planeja tarefas multi-ferramenta a partir da pergunta do usuário.
 * Reutiliza os mesmos actionIds das Tools existentes (Contacts, Calendar, Gmail).
 */
export function planMultiToolTask(query: string): MultiToolTaskPlan {
  if (MEETING_INVITE_PATTERN.test(query)) {
    return {
      selected: true,
      summary: "Agendar reunião e enviar convite por e-mail.",
      steps: planMeetingInviteTask(query),
    };
  }

  return { selected: false };
}

export function createMultiToolTaskPlanner() {
  return { plan: planMultiToolTask };
}
