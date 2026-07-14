import { buildToolInterpretationPrompt } from "./prompt-builder";

import type {
  ToolInterpretationInput,
  ToolInterpretationResult,
  ToolResultFormatter,
} from "./types";

/** Kill-switch da Sprint 87 — desliga a camada sem deploy. */
export function isToolInterpreterEnabled(): boolean {
  return process.env.SAMUEL_TOOL_INTERPRETER_ENABLED !== "false";
}

function resolveActionId(input: ToolInterpretationInput): string | undefined {
  if (input.actionId) return input.actionId;

  const fromToolInput = input.toolInput?.actionId ?? input.toolInput?.queryId;
  if (typeof fromToolInput === "string") return fromToolInput;

  const output = input.toolOutput;
  if (output && typeof output === "object") {
    const record = output as Record<string, unknown>;
    const fromOutput = record.actionId ?? record.queryId;
    if (typeof fromOutput === "string") return fromOutput;
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function formatSubjectBullets(subjects: string[], limit = 10): string {
  if (subjects.length === 0) return "";
  return ["Principais assuntos:", ...subjects.slice(0, limit).map((subject) => `• ${subject}`)].join(
    "\n",
  );
}

const gmailFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output) return null;

  const actionId = (output.actionId as string | undefined) ?? resolveActionId(input);
  const summary = typeof output.summary === "string" ? output.summary : "";
  const data = asRecord(output.data) ?? {};

  switch (actionId) {
    case "inbox_summary": {
      const unreadCount = typeof data.unreadCount === "number" ? data.unreadCount : 0;
      const messages = Array.isArray(data.messages) ? data.messages : [];
      const subjects = messages
        .map((message) => {
          const row = asRecord(message);
          return typeof row?.subject === "string" && row.subject.trim()
            ? row.subject.trim()
            : "(sem assunto)";
        })
        .filter(Boolean);

      const facts = [
        "A Gmail Tool retornou:",
        "",
        `${unreadCount} mensagem(ns) não lida(s).`,
        summary ? summary : "",
        "",
        formatSubjectBullets(subjects),
      ]
        .filter((line) => line.length > 0)
        .join("\n");

      const humanFallback = [
        summary,
        subjects.length > 0 ? `Principais assuntos: ${subjects.slice(0, 5).join("; ")}.` : "",
      ]
        .filter(Boolean)
        .join(" ");

      return { facts, humanFallback };
    }
    case "search_messages": {
      const query = typeof data.query === "string" ? data.query : "";
      const count = typeof data.count === "number" ? data.count : 0;
      const messages = Array.isArray(data.messages) ? data.messages : [];
      const subjects = messages
        .map((message) => {
          const row = asRecord(message);
          return typeof row?.subject === "string" && row.subject.trim()
            ? row.subject.trim()
            : "(sem assunto)";
        })
        .filter(Boolean);

      const facts = [
        "A Gmail Tool retornou:",
        "",
        summary || `${count} e-mail(s) encontrado(s) para "${query}".`,
        query ? `Termo de busca: ${query}` : "",
        "",
        formatSubjectBullets(subjects),
      ]
        .filter((line) => line.length > 0)
        .join("\n");

      return { facts, humanFallback: summary || `${count} e-mail(s) encontrado(s).` };
    }
    case "read_message": {
      const message = asRecord(data.message);
      const from = typeof message?.from === "string" ? message.from : "remetente desconhecido";
      const subject =
        typeof message?.subject === "string" && message.subject.trim()
          ? message.subject
          : "(sem assunto)";
      const snippet = typeof message?.snippet === "string" ? message.snippet : "";
      const body = typeof message?.body === "string" ? message.body : "";

      const facts = [
        "A Gmail Tool retornou:",
        "",
        summary || `E-mail de ${from}: "${subject}".`,
        snippet ? `Trecho: ${snippet}` : "",
        body ? `Conteúdo:\n${body.slice(0, 1200)}` : "",
      ]
        .filter((line) => line.length > 0)
        .join("\n");

      return {
        facts,
        humanFallback: summary || `E-mail de ${from}: "${subject}".`,
      };
    }
    case "reply_message": {
      const facts = [
        "A Gmail Tool retornou:",
        "",
        summary || "Resposta enviada com sucesso.",
        typeof data.body === "string" ? `Texto enviado: ${data.body}` : "",
      ]
        .filter((line) => line.length > 0)
        .join("\n");

      return { facts, humanFallback: summary || "Resposta enviada com sucesso." };
    }
    default:
      return null;
  }
};

const supabaseQueryFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.summary !== "string") return null;

  const queryId = (output.queryId as string | undefined) ?? resolveActionId(input);
  const data = asRecord(output.data) ?? {};

  const detailLines: string[] = [];
  if (queryId === "count_contacts" && typeof data.total === "number") {
    detailLines.push(`Total de contatos no CRM: ${data.total}.`);
  }
  if (queryId === "list_inactive_contacts" && Array.isArray(data.contacts)) {
    const names = data.contacts
      .map((contact) => {
        const row = asRecord(contact);
        const first = typeof row?.first_name === "string" ? row.first_name : "";
        const last = typeof row?.last_name === "string" ? row.last_name : "";
        const company = typeof row?.company === "string" ? row.company : "";
        return [first, last].filter(Boolean).join(" ") || company || null;
      })
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) {
      detailLines.push(`Contatos inativos: ${names.slice(0, 8).join("; ")}.`);
    }
  }
  if (queryId === "revenue_current_month" && typeof data.total === "number") {
    detailLines.push(`Faturamento do mês: R$ ${data.total.toLocaleString("pt-BR")}.`);
  }

  const facts = [
    "A Supabase Query Tool retornou:",
    "",
    output.summary,
    ...detailLines,
  ].join("\n");

  return { facts, humanFallback: output.summary };
};

const calculatorFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || output.result == null) return null;

  const expression =
    input.toolInput?.a != null && input.toolInput?.b != null && input.toolInput?.operator
      ? `${input.toolInput.a} ${input.toolInput.operator} ${input.toolInput.b}`
      : "expressão aritmética";

  const facts = [
    "A Calculator Tool retornou:",
    "",
    `Resultado de ${expression}: ${output.result}.`,
  ].join("\n");

  return { facts, humanFallback: `O resultado do cálculo é ${output.result}.` };
};

const dateTimeFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.value !== "string") return null;

  const facts = ["A Date-Time Tool retornou:", "", `Data/hora atual: ${output.value}.`].join("\n");
  return { facts, humanFallback: `A data/hora atual é ${output.value}.` };
};

const uuidFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  const uuids = Array.isArray(output?.uuids) ? (output.uuids as string[]) : [];
  if (uuids.length === 0) return null;

  const facts = ["A UUID Tool retornou:", "", `Identificador gerado: ${uuids.join(", ")}.`].join(
    "\n",
  );
  return { facts, humanFallback: `UUID gerado: ${uuids.join(", ")}.` };
};

const jsonFormatterFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.formatted !== "string") return null;

  const facts = [
    "A JSON Formatter Tool retornou:",
    "",
    "JSON validado e formatado com sucesso.",
    output.formatted,
  ].join("\n");

  return {
    facts,
    humanFallback: "JSON formatado com sucesso.",
  };
};

function formatCalendarEventBullets(events: unknown[]): string {
  return events
    .map((event) => {
      const row = asRecord(event);
      const startLabel = typeof row?.startLabel === "string" ? row.startLabel : "";
      const title = typeof row?.title === "string" ? row.title : "(sem título)";
      return startLabel ? `• ${startLabel} — ${title}` : `• ${title}`;
    })
    .join("\n");
}

const googleCalendarFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.summary !== "string") return null;

  const data = asRecord(output.data) ?? {};
  const eventCount = typeof data.eventCount === "number" ? data.eventCount : 0;
  const events = Array.isArray(data.events) ? data.events : [];
  const freeSlots = Array.isArray(data.freeSlots) ? data.freeSlots : [];
  const eventBullets = formatCalendarEventBullets(events);
  const freeLines = freeSlots
    .map((slot) => {
      const row = asRecord(slot);
      if (!row) return null;
      const startLabel = typeof row.startLabel === "string" ? row.startLabel : "";
      const endLabel = typeof row.endLabel === "string" ? row.endLabel : "";
      return startLabel && endLabel ? `Livre: ${startLabel} — ${endLabel}` : null;
    })
    .filter((line): line is string => Boolean(line));

  const facts = [
    "A Google Calendar Tool retornou:",
    "",
    output.summary,
    eventCount > 0 ? `${eventCount} evento(s) encontrado(s):` : "",
    eventBullets,
    freeLines.length > 0 ? "Janelas livres:" : "",
    freeLines.join("\n"),
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  const humanFallback = [
    output.summary,
    eventBullets,
    freeLines[0] ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  return { facts, humanFallback };
};

function formatContactBullets(contacts: unknown[]): string {
  return contacts
    .map((contact) => {
      const row = asRecord(contact);
      const name = typeof row?.name === "string" ? row.name : "(sem nome)";
      const phone = Array.isArray(row?.phones) ? row.phones[0] : undefined;
      const email = Array.isArray(row?.emails) ? row.emails[0] : undefined;
      const company = typeof row?.company === "string" ? row.company : undefined;
      const birthday = typeof row?.birthdayLabel === "string" ? row.birthdayLabel : undefined;
      const details = [phone, email, company, birthday ? `aniversário ${birthday}` : undefined]
        .filter(Boolean)
        .join(", ");
      return details ? `• ${name} — ${details}` : `• ${name}`;
    })
    .join("\n");
}

const googleContactsFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.summary !== "string") return null;

  const data = asRecord(output.data) ?? {};
  const contactCount = typeof data.contactCount === "number" ? data.contactCount : 0;
  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const contactBullets = formatContactBullets(contacts);
  const email = typeof data.email === "string" ? data.email : undefined;
  const phone = typeof data.phone === "string" ? data.phone : undefined;

  const facts = [
    "A Google Contacts Tool retornou:",
    "",
    output.summary,
    contactCount > 0 ? `${contactCount} contato(s):` : "",
    contactBullets,
    email ? `E-mail: ${email}` : "",
    phone ? `Telefone: ${phone}` : "",
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  return {
    facts,
    humanFallback: [output.summary, contactBullets].filter(Boolean).join("\n"),
  };
};

function formatFileBullets(files: unknown[]): string {
  if (files.length === 0) return "";
  const lines = files
    .map((file) => {
      const row = asRecord(file);
      if (!row) return null;
      const name = typeof row.name === "string" ? row.name : "";
      const mimeLabel = typeof row.mimeLabel === "string" ? row.mimeLabel : "";
      const modifiedLabel = typeof row.modifiedLabel === "string" ? row.modifiedLabel : "";
      if (!name) return null;
      return `• ${name}${mimeLabel ? ` (${mimeLabel})` : ""}${modifiedLabel ? ` — ${modifiedLabel}` : ""}`;
    })
    .filter((line): line is string => Boolean(line));
  return lines.length > 0 ? ["Arquivos:", ...lines].join("\n") : "";
}

const googleDriveFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output || typeof output.summary !== "string") return null;

  const data = asRecord(output.data) ?? {};
  const fileCount = typeof data.fileCount === "number" ? data.fileCount : 0;
  const files = Array.isArray(data.files) ? data.files : [];
  const fileBullets = formatFileBullets(files);
  const content = typeof data.content === "string" ? data.content : undefined;
  const excerpt = content ? content.slice(0, 1200) : undefined;

  const facts = [
    "A Google Drive Tool retornou:",
    "",
    output.summary,
    fileCount > 0 ? `${fileCount} arquivo(s):` : "",
    fileBullets,
    excerpt ? "Conteúdo do arquivo:" : "",
    excerpt ?? "",
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  const humanFallback = [output.summary, fileBullets, excerpt ? `Excerto:\n${excerpt}` : ""]
    .filter(Boolean)
    .join("\n");

  return { facts, humanFallback };
};

const genericFormatter: ToolResultFormatter = (input) => {
  const output = asRecord(input.toolOutput);
  if (!output) return null;

  if (typeof output.summary === "string" && output.summary.trim()) {
    const label = input.toolName.replace(/-/g, " ");
    return {
      facts: [`A ${label} Tool retornou:`, "", output.summary].join("\n"),
      humanFallback: output.summary,
    };
  }

  return null;
};

const TOOL_FORMATTERS: Record<string, ToolResultFormatter> = {
  gmail: gmailFormatter,
  "google-calendar": googleCalendarFormatter,
  "google-contacts": googleContactsFormatter,
  "google-drive": googleDriveFormatter,
  "supabase-query": supabaseQueryFormatter,
  calculator: calculatorFormatter,
  "date-time": dateTimeFormatter,
  uuid: uuidFormatter,
  "json-formatter": jsonFormatterFormatter,
};

function formatToolFacts(input: ToolInterpretationInput): { facts: string; humanFallback: string } | null {
  const formatter = TOOL_FORMATTERS[input.toolName] ?? genericFormatter;
  return formatter(input) ?? genericFormatter(input);
}

export type MultiToolInterpretationStep = {
  toolName: string;
  actionId?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  status: "success" | "error" | "skipped";
};

/**
 * Interpreta o resultado de uma Tool e produz contexto textual para o AI
 * Gateway. Quando o kill-switch está desligado, devolve `used: false` e o
 * runtime mantém o comportamento anterior (`buildToolResultSummary`).
 */
export function interpretToolResult(
  input: ToolInterpretationInput | null,
): ToolInterpretationResult {
  if (!isToolInterpreterEnabled()) {
    return { enabled: false, used: false };
  }

  if (!input) {
    return { enabled: true, used: false };
  }

  const formatted = formatToolFacts(input);
  if (!formatted) {
    return { enabled: true, used: false, toolName: input.toolName };
  }

  const actionId = resolveActionId(input);

  return {
    enabled: true,
    used: true,
    toolName: input.toolName,
    actionId,
    contextForAi: buildToolInterpretationPrompt(formatted.facts, input.userQuery),
    humanFallback: formatted.humanFallback,
  };
}

/**
 * Combina interpretações de múltiplas etapas bem-sucedidas num único bloco
 * textual para o AI Gateway. Etapas com erro ou ignoradas não entram no
 * contexto — apenas a etapa que falhou é interrompida.
 */
export function interpretMultiToolTaskResults(input: {
  steps: MultiToolInterpretationStep[];
  intent: ToolInterpretationInput["intent"];
  conversationContext?: string;
  userQuery: string;
}): ToolInterpretationResult {
  if (!isToolInterpreterEnabled()) {
    return { enabled: false, used: false };
  }

  const successfulSteps = input.steps.filter(
    (step) => step.status === "success" && step.toolOutput != null,
  );
  if (successfulSteps.length === 0) {
    return { enabled: true, used: false };
  }

  const sections: string[] = [];
  for (const step of successfulSteps) {
    const single = interpretToolResult({
      toolName: step.toolName,
      actionId: step.actionId,
      toolInput: step.toolInput,
      toolOutput: step.toolOutput,
      intent: input.intent,
      conversationContext: input.conversationContext,
      userQuery: input.userQuery,
    });
    if (single.used && single.humanFallback) {
      sections.push(`• ${step.toolName}: ${single.humanFallback}`);
    }
  }

  if (sections.length === 0) {
    return { enabled: true, used: false };
  }

  const skippedOrFailed = input.steps.filter((step) => step.status !== "success");
  const statusNote =
    skippedOrFailed.length > 0
      ? `\n\nNota: ${skippedOrFailed.length} etapa(s) não concluída(s) (${skippedOrFailed.map((s) => `${s.toolName}:${s.status}`).join(", ")}).`
      : "";

  const facts = ["Plano multi-ferramenta executado:", "", ...sections, statusNote].join("\n");

  return {
    enabled: true,
    used: true,
    contextForAi: buildToolInterpretationPrompt(facts, input.userQuery),
    humanFallback: sections.join("\n"),
  };
}

export function createToolInterpreter() {
  return { interpret: interpretToolResult, isEnabled: isToolInterpreterEnabled };
}
