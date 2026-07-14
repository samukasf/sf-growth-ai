import type { StepOutputContext } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractContactEmail(output: unknown): string | undefined {
  const record = asRecord(output);
  const data = asRecord(record?.data);
  if (!data) return undefined;

  if (typeof data.email === "string" && data.email) return data.email;

  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const first = asRecord(contacts[0]);
  const emails = Array.isArray(first?.emails) ? first.emails : [];
  return typeof emails[0] === "string" ? emails[0] : undefined;
}

function extractContactName(output: unknown): string | undefined {
  const record = asRecord(output);
  const data = asRecord(record?.data);
  if (!data) return undefined;

  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const first = asRecord(contacts[0]);
  return typeof first?.name === "string" ? first.name : undefined;
}

function extractCalendarEvent(output: unknown): {
  title?: string;
  startLabel?: string;
} | null {
  const record = asRecord(output);
  const data = asRecord(record?.data);
  const event = asRecord(data?.event);
  if (!event) return null;

  return {
    title: typeof event.title === "string" ? event.title : undefined,
    startLabel: typeof event.startLabel === "string" ? event.startLabel : undefined,
  };
}

function formatInviteBody(options: {
  contactName?: string;
  email?: string;
  eventTitle?: string;
  eventTime?: string;
}): string {
  const lines = [
    options.contactName ? `Convite para ${options.contactName}` : "Convite de reunião",
    options.eventTitle ? `Evento: ${options.eventTitle}` : undefined,
    options.eventTime ? `Horário: ${options.eventTime}` : undefined,
    options.email ? `Destinatário: ${options.email}` : undefined,
    "",
    "Confirmo o agendamento e envio do convite.",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}

/**
 * Enriquece inputs de etapas com resultados de etapas anteriores bem-sucedidas.
 */
export function resolveStepInput(
  stepId: string,
  toolName: string,
  input: Record<string, unknown>,
  context: Record<string, StepOutputContext>,
): Record<string, unknown> {
  const resolved = { ...input };

  if (toolName === "gmail" && input.actionId === "reply_message") {
    const contacts = context.contacts;
    const calendar = context.calendar;
    const email = contacts?.status === "success" ? extractContactEmail(contacts.output) : undefined;
    const contactName = contacts?.status === "success" ? extractContactName(contacts.output) : undefined;
    const event = calendar?.status === "success" ? extractCalendarEvent(calendar.output) : null;

    resolved.body = formatInviteBody({
      contactName,
      email,
      eventTitle: event?.title,
      eventTime: event?.startLabel,
    });
  }

  if (stepId === "calendar" && toolName === "google-calendar" && input.actionId === "calendar_create") {
    const contacts = context.contacts;
    const contactName = contacts?.status === "success" ? extractContactName(contacts.output) : undefined;
    if (contactName && typeof resolved.title === "string") {
      resolved.title = `Reunião com ${contactName}`;
    }
  }

  return resolved;
}

export function areDependenciesMet(
  dependsOn: string[] | undefined,
  context: Record<string, StepOutputContext>,
): boolean {
  if (!dependsOn || dependsOn.length === 0) return true;
  return dependsOn.every((depId) => context[depId]?.status === "success");
}
