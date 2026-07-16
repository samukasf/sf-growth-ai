import { getGmailClientForCompany } from "@/integrations/gmail";

import type {
  GmailActionArgs,
  GmailActionId,
  GmailActionPlan,
  GmailToolResult,
} from "./gmail.types";
import { signGmailConfirmation } from "./gmail.confirmation";
import { parseGmailIntent } from "./gmail.intent";

function formatMessageLine(message: {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  unread: boolean;
  date: string;
}) {
  const unread = message.unread ? "●" : "○";
  return `${unread} [${message.id}] ${message.from} — ${message.subject || "(sem assunto)"} · ${message.snippet}`;
}

export function buildGmailActionPlan(
  query: string,
  companyId: string,
): GmailActionPlan | null {
  const plan = parseGmailIntent(query);
  if (!plan) return null;

  if (plan.requiresConfirmation) {
    plan.confirmationToken = signGmailConfirmation({
      companyId,
      actionId: plan.actionId,
      args: plan.args,
      issuedAt: Date.now(),
    });
  }

  return plan;
}

export async function executeGmailTool(
  companyId: string,
  actionId: GmailActionId,
  args: GmailActionArgs = {},
): Promise<GmailToolResult> {
  try {
    const client = await getGmailClientForCompany(companyId);

    switch (actionId) {
      case "gmail_unread_count": {
        const count = await client.getUnreadCount();
        return {
          ok: true,
          actionId,
          summary: `Há ${count} e-mail(s) não lido(s) na inbox.`,
          data: { count },
        };
      }
      case "gmail_inbox": {
        const messages = await client.listMessages({
          labelIds: args.query ? undefined : ["INBOX"],
          query: args.query,
          maxResults: args.maxResults ?? 8,
        });
        const lines = messages.map(formatMessageLine);
        return {
          ok: true,
          actionId,
          summary:
            messages.length === 0
              ? "A inbox está vazia (ou sem resultados)."
              : `Inbox (${messages.length}):\n${lines.join("\n")}`,
          data: { messages },
        };
      }
      case "gmail_search": {
        const messages = await client.searchMessages(
          args.query || "in:inbox",
          args.maxResults ?? 8,
        );
        return {
          ok: true,
          actionId,
          summary:
            messages.length === 0
              ? "Nenhum e-mail encontrado."
              : `Resultados (${messages.length}):\n${messages.map(formatMessageLine).join("\n")}`,
          data: { messages },
        };
      }
      case "gmail_read": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        const message = await client.getMessage(args.messageId);
        return {
          ok: true,
          actionId,
          summary: `De: ${message.from}\nPara: ${message.to}\nAssunto: ${message.subject}\nData: ${message.date}\n\n${message.body.slice(0, 4000)}`,
          data: { message },
        };
      }
      case "gmail_list_labels": {
        const labels = await client.listLabels();
        return {
          ok: true,
          actionId,
          summary: `Etiquetas (${labels.length}): ${labels.map((label) => label.name).join(", ")}`,
          data: { labels },
        };
      }
      case "gmail_draft": {
        if (!args.to || !args.subject || !args.body) {
          throw new Error("to, subject e body são obrigatórios.");
        }
        const draft = await client.createDraft({
          to: args.to,
          subject: args.subject,
          body: args.body,
          cc: args.cc,
          bcc: args.bcc,
        });
        return {
          ok: true,
          actionId,
          summary: `Rascunho criado (draftId ${draft.draftId}) para ${args.to}.`,
          data: draft,
        };
      }
      case "gmail_reply_draft": {
        if (!args.messageId || !args.body) {
          throw new Error("messageId e body são obrigatórios.");
        }
        const draft = await client.createReplyDraft({
          messageId: args.messageId,
          body: args.body,
        });
        return {
          ok: true,
          actionId,
          summary: `Rascunho de resposta criado (draftId ${draft.draftId}).`,
          data: draft,
        };
      }
      case "gmail_send": {
        if (!args.to || !args.subject || !args.body) {
          throw new Error("to, subject e body são obrigatórios.");
        }
        const sent = await client.sendMessage({
          to: args.to,
          subject: args.subject,
          body: args.body,
          cc: args.cc,
          bcc: args.bcc,
        });
        return {
          ok: true,
          actionId,
          summary: `E-mail enviado para ${args.to} (messageId ${sent.messageId}).`,
          data: sent,
        };
      }
      case "gmail_reply": {
        if (!args.messageId || !args.body) {
          throw new Error("messageId e body são obrigatórios.");
        }
        const sent = await client.replyToMessage({
          messageId: args.messageId,
          body: args.body,
        });
        return {
          ok: true,
          actionId,
          summary: `Resposta enviada (messageId ${sent.messageId}).`,
          data: sent,
        };
      }
      case "gmail_archive": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        await client.archiveMessage(args.messageId);
        return {
          ok: true,
          actionId,
          summary: `Mensagem ${args.messageId} arquivada (removida da inbox).`,
        };
      }
      case "gmail_trash": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        await client.trashMessage(args.messageId);
        return {
          ok: true,
          actionId,
          summary: `Mensagem ${args.messageId} movida para a lixeira.`,
        };
      }
      case "gmail_mark_read": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        await client.markAsRead(args.messageId);
        return { ok: true, actionId, summary: `Mensagem ${args.messageId} marcada como lida.` };
      }
      case "gmail_mark_unread": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        await client.markAsUnread(args.messageId);
        return {
          ok: true,
          actionId,
          summary: `Mensagem ${args.messageId} marcada como não lida.`,
        };
      }
      case "gmail_star": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        await client.starMessage(args.messageId);
        return { ok: true, actionId, summary: `Estrela adicionada à mensagem ${args.messageId}.` };
      }
      case "gmail_label": {
        if (!args.messageId) throw new Error("messageId é obrigatório.");
        let labelId = args.labelId;
        if (!labelId && args.labelName) {
          const labels = await client.listLabels();
          const found = labels.find(
            (label) => label.name.toLowerCase() === args.labelName!.toLowerCase(),
          );
          labelId = found?.id;
        }
        if (!labelId) throw new Error("Etiqueta não encontrada.");
        await client.applyLabel(args.messageId, labelId);
        return {
          ok: true,
          actionId,
          summary: `Etiqueta aplicada à mensagem ${args.messageId}.`,
        };
      }
      default:
        return {
          ok: false,
          actionId,
          summary: "Ação Gmail desconhecida.",
          error: "UNKNOWN_ACTION",
        };
    }
  } catch (error) {
    return {
      ok: false,
      actionId,
      summary: error instanceof Error ? error.message : "Falha na ação Gmail.",
      error: error instanceof Error ? error.message : "UNKNOWN",
    };
  }
}

export function gmailResultToFragment(result: GmailToolResult): string {
  const tag = result.ok ? "GMAIL — EXECUTADO" : "GMAIL — ERRO";
  return `[${tag}] ${result.summary}`;
}
