/**
 * Gmail Tool (Sprint 87) — permite ao Samuel acessar o Gmail real da empresa
 * através do Tool Orchestrator já existente.
 *
 * Reutiliza `integrations/gmail` (OAuth + Gmail API real da Sprint 86).
 * A Tool não conhece o Samuel Runtime — apenas executa ações autorizadas
 * via whitelist fixa de `actionId`, sempre escopadas por `companyId`.
 */
import { GmailApiError, getGmailClientForCompany } from "@/integrations/gmail";
import type { GmailMessage, GmailMessageSummary } from "@/integrations/gmail";

import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type GmailActionId = "inbox_summary" | "search_messages" | "read_message" | "reply_message";

export type GmailToolInput = {
  actionId: GmailActionId;
  /** Termo de busca Gmail (ex.: "from:cliente@empresa.com is:unread"). */
  query?: string;
  /** ID da mensagem Gmail — opcional em read/reply (usa a mais recente da inbox). */
  messageId?: string;
  /** Corpo da resposta — obrigatório para reply_message. */
  body?: string;
  maxResults?: number;
};

export type GmailToolOutput = {
  actionId: GmailActionId;
  summary: string;
  data: Record<string, unknown>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_MAX_RESULTS = 10;

function isUuidLike(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function describeError(error: unknown): string {
  if (error instanceof GmailApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "erro desconhecido";
}

function wrapGmailError(error: unknown): never {
  throw new ToolExecutionError("gmail", describeError(error), error);
}

/** Kill-switch da Sprint 87: desliga a execução real sem deploy. */
function isGmailToolEnabled(): boolean {
  return process.env.SAMUEL_GMAIL_TOOL_ENABLED !== "false";
}

function formatMessageLine(message: GmailMessageSummary): string {
  const unread = message.unread ? "[não lida] " : "";
  const subject = message.subject || "(sem assunto)";
  return `${unread}${message.from}: ${subject} — ${message.snippet}`;
}

function serializeMessage(message: GmailMessage | GmailMessageSummary) {
  return {
    id: message.id,
    threadId: message.threadId,
    subject: message.subject,
    from: message.from,
    snippet: message.snippet,
    date: message.date,
    unread: message.unread,
    ...("body" in message ? { body: message.body } : {}),
  };
}

async function resolveLatestMessageId(
  companyId: string,
  preferUnread = false,
): Promise<string> {
  const client = await getGmailClientForCompany(companyId);
  const query = preferUnread ? "in:inbox is:unread" : "in:inbox";
  const messages = await client.searchMessages(query, 1);
  if (messages.length === 0) {
    throw new ToolExecutionError("gmail", "Nenhuma mensagem encontrada na inbox para esta operação.");
  }
  return messages[0].id;
}

async function inboxSummary(companyId: string, maxResults: number): Promise<GmailToolOutput> {
  const client = await getGmailClientForCompany(companyId);
  const inbox = await client.getInboxSummary(maxResults);
  const preview = inbox.messages.map(formatMessageLine).join("\n");

  return {
    actionId: "inbox_summary",
    summary: `Inbox de ${inbox.emailAddress}: ${inbox.unreadCount} não lida(s), ${inbox.messages.length} mensagem(ns) recente(s).`,
    data: {
      emailAddress: inbox.emailAddress,
      unreadCount: inbox.unreadCount,
      messages: inbox.messages.map(serializeMessage),
      preview,
    },
  };
}

async function searchMessages(
  companyId: string,
  query: string,
  maxResults: number,
): Promise<GmailToolOutput> {
  const client = await getGmailClientForCompany(companyId);
  const messages = await client.searchMessages(query, maxResults);
  const preview = messages.map(formatMessageLine).join("\n");

  return {
    actionId: "search_messages",
    summary:
      messages.length > 0
        ? `${messages.length} e-mail(s) encontrado(s) para "${query}".`
        : `Nenhum e-mail encontrado para "${query}".`,
    data: {
      query,
      count: messages.length,
      messages: messages.map(serializeMessage),
      preview,
    },
  };
}

async function readMessage(companyId: string, messageId?: string): Promise<GmailToolOutput> {
  const resolvedId = messageId ?? (await resolveLatestMessageId(companyId));
  const client = await getGmailClientForCompany(companyId);
  const message = await client.getMessage(resolvedId);

  return {
    actionId: "read_message",
    summary: `E-mail de ${message.from}: "${message.subject || "(sem assunto)"}".`,
    data: {
      message: serializeMessage(message),
    },
  };
}

async function replyMessage(
  companyId: string,
  body: string,
  messageId?: string,
): Promise<GmailToolOutput> {
  if (!body.trim()) {
    throw new ToolExecutionError("gmail", "Corpo da resposta ausente — informe o texto a enviar.");
  }

  const resolvedId = messageId ?? (await resolveLatestMessageId(companyId, true));
  const client = await getGmailClientForCompany(companyId);
  const sent = await client.replyToMessage({ messageId: resolvedId, body: body.trim() });

  return {
    actionId: "reply_message",
    summary: `Resposta enviada com sucesso (messageId: ${sent.messageId}).`,
    data: {
      repliedToMessageId: resolvedId,
      sentMessageId: sent.messageId,
      threadId: sent.threadId,
      body: body.trim(),
    },
  };
}

const ACTION_HANDLERS: Record<
  GmailActionId,
  (companyId: string, input: GmailToolInput) => Promise<GmailToolOutput>
> = {
  inbox_summary: (companyId, input) =>
    inboxSummary(companyId, input.maxResults ?? DEFAULT_MAX_RESULTS),
  search_messages: (companyId, input) => {
    const query = input.query?.trim();
    if (!query) {
      throw new ToolExecutionError("gmail", "Termo de busca ausente para search_messages.");
    }
    return searchMessages(companyId, query, input.maxResults ?? DEFAULT_MAX_RESULTS);
  },
  read_message: (companyId, input) => readMessage(companyId, input.messageId),
  reply_message: (companyId, input) => replyMessage(companyId, input.body ?? "", input.messageId),
};

export class GmailTool implements Tool<GmailToolInput, GmailToolOutput> {
  readonly name = "gmail";
  readonly description =
    "Acessa o Gmail real da empresa conectada: resumir inbox, pesquisar, ler e responder e-mails.";
  readonly inputSchema = {
    actionId: "'inbox_summary' | 'search_messages' | 'read_message' | 'reply_message'",
    query: "string (search_messages)",
    messageId: "string (read_message, reply_message)",
    body: "string (reply_message)",
    maxResults: "number (opcional)",
  };

  async execute(context: ToolExecutionContext<GmailToolInput>): Promise<GmailToolOutput> {
    if (!isGmailToolEnabled()) {
      throw new ToolExecutionError(
        this.name,
        "Gmail Tool está desabilitada (SAMUEL_GMAIL_TOOL_ENABLED=false).",
      );
    }

    const { actionId } = context.input;
    const handler = ACTION_HANDLERS[actionId];

    if (!handler) {
      throw new ToolExecutionError(this.name, `actionId desconhecido ou não autorizado: "${actionId}".`);
    }

    if (!isUuidLike(context.companyId)) {
      throw new ToolExecutionError(
        this.name,
        `companyId ausente ou inválido — não é possível acessar o Gmail para "${context.companyId ?? "undefined"}".`,
      );
    }

    try {
      return await handler(context.companyId, context.input);
    } catch (error) {
      if (error instanceof ToolExecutionError) throw error;
      wrapGmailError(error);
    }
  }
}
