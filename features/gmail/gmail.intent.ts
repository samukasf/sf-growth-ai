import type { GmailActionId, GmailActionArgs, GmailActionPlan } from "./gmail.types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractEmail(text: string): string | undefined {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0];
}

function extractQuoted(text: string): string | undefined {
  const match =
    text.match(/[«"']([^«"']{8,})[»"']/) ||
    text.match(/:\s*([\s\S]{12,})$/);
  return match?.[1]?.trim();
}

function extractNaturalBody(text: string): string | undefined {
  const match = text.match(
    /\b(?:dizendo|com a mensagem|mensagem|texto|corpo)\b\s*[:=]?\s*([\s\S]{3,})$/i,
  );
  const body = match?.[1]?.trim();
  if (!body) return undefined;
  return body
    .replace(/\b(?:assunto|subject)\s*[:=]\s*[«"']?[^«"'\n]+[»"']?/i, "")
    .trim();
}

function extractMessageId(text: string): string | undefined {
  const match = text.match(/\b(?:id|messageId|mensagem)\s*[:=]?\s*([a-zA-Z0-9_-]{6,})\b/i);
  return match?.[1];
}

function mutates(actionId: GmailActionId): boolean {
  return ![
    "gmail_inbox",
    "gmail_search",
    "gmail_read",
    "gmail_unread_count",
    "gmail_list_labels",
  ].includes(actionId);
}

function plan(
  actionId: GmailActionId,
  args: GmailActionArgs,
  title: string,
  preview: string,
): GmailActionPlan {
  return {
    surface: "gmail",
    actionId,
    args,
    requiresConfirmation: mutates(actionId),
    title,
    preview,
  };
}

/**
 * Interpreta pedidos em linguagem natural sobre e-mail.
 * Retorna null quando a mensagem não é sobre Gmail/ações de caixa.
 */
export function parseGmailIntent(query: string): GmailActionPlan | null {
  const normalized = normalize(query);
  const aboutEmail =
    /\b(gmail|e-?mails?|emails?|inbox|caixa de entrada|correio|mensagens?)\b/.test(normalized) ||
    /\b(envi\w*|respond\w*|apag\w*|exclu\w*|arquiv\w*|lixeira|nao lidos?|marcar como|rascunho|label|etiqueta|estrel\w*)\b/.test(
      normalized,
    );

  if (!aboutEmail) return null;

  const messageId = extractMessageId(query);
  const email = extractEmail(query);
  const body = extractQuoted(query) ?? extractNaturalBody(query);

  if (/\b(apag\w*|exclu\w*|lixeira|trash|delet\w*)\b/.test(normalized)) {
    if (!messageId) {
      return plan(
        "gmail_inbox",
        { maxResults: 8, query: "in:inbox" },
        "Listar e-mails para apagar",
        "Preciso do ID da mensagem. Vou listar a inbox para escolher qual enviar para a lixeira.",
      );
    }
    return plan(
      "gmail_trash",
      { messageId },
      "Mover e-mail para a lixeira",
      `Mover a mensagem ${messageId} para a lixeira do Gmail.`,
    );
  }

  if (/\b(arquiv\w*)\b/.test(normalized)) {
    if (!messageId) {
      return plan(
        "gmail_inbox",
        { maxResults: 8 },
        "Listar e-mails para arquivar",
        "Preciso do ID da mensagem. Vou listar a inbox para escolher qual arquivar.",
      );
    }
    return plan(
      "gmail_archive",
      { messageId },
      "Arquivar e-mail",
      `Remover a mensagem ${messageId} da inbox (arquivar).`,
    );
  }

  if (/\b(marcar como lido|mark as read|como lido)\b/.test(normalized)) {
    if (!messageId) {
      return plan("gmail_inbox", { maxResults: 8, query: "is:unread" }, "Listar não lidos", "Listar não lidos para marcar.");
    }
    return plan("gmail_mark_read", { messageId }, "Marcar como lido", `Marcar ${messageId} como lido.`);
  }

  if (/\b(marcar como nao lido|marcar como não lido|mark as unread)\b/.test(normalized)) {
    if (!messageId) {
      return plan("gmail_inbox", { maxResults: 8 }, "Listar inbox", "Listar mensagens para marcar como não lidas.");
    }
    return plan("gmail_mark_unread", { messageId }, "Marcar como não lido", `Marcar ${messageId} como não lido.`);
  }

  if (/\b(estrel|star|favorit)\b/.test(normalized)) {
    if (!messageId) {
      return plan("gmail_inbox", { maxResults: 8 }, "Listar inbox", "Listar mensagens para destacar com estrela.");
    }
    return plan("gmail_star", { messageId }, "Destacar e-mail", `Adicionar estrela à mensagem ${messageId}.`);
  }

  if (/\b(etiqueta|label|rotular)\b/.test(normalized)) {
    const labelMatch = query.match(/(?:etiqueta|label|rotulo|rótulo)\s+[«"']?([^«"'\n,]{2,40})/i);
    const labelName = labelMatch?.[1]?.trim();
    if (!messageId || !labelName) {
      return plan("gmail_list_labels", {}, "Listar etiquetas", "Listar etiquetas disponíveis no Gmail.");
    }
    return plan(
      "gmail_label",
      { messageId, labelName },
      "Aplicar etiqueta",
      `Aplicar a etiqueta "${labelName}" à mensagem ${messageId}.`,
    );
  }

  if (/\b(respond\w*|reply)\b/.test(normalized)) {
    if (!messageId) {
      return plan(
        "gmail_inbox",
        { maxResults: 8 },
        "Listar e-mails para responder",
        "Preciso do ID da mensagem. Vou listar a inbox.",
      );
    }
    const replyBody = body || "Obrigado pelo contacto. Retorno em breve.";
    if (/\b(rascunho|draft)\b/.test(normalized)) {
      return plan(
        "gmail_reply_draft",
        { messageId, body: replyBody },
        "Criar rascunho de resposta",
        `Criar rascunho de resposta a ${messageId}.`,
      );
    }
    return plan(
      "gmail_reply",
      { messageId, body: replyBody },
      "Responder e-mail",
      `Enviar resposta à mensagem ${messageId}.`,
    );
  }

  if (/\b(envi\w*|mandar|send)\b/.test(normalized) && (email || /\bpara\b/.test(normalized))) {
    const subjectMatch = query.match(/(?:assunto|subject)\s*[:=]\s*[«"']?([^«"'\n]+)[»"']?/i);
    const subject = subjectMatch?.[1]?.trim() || "Mensagem do Samuel AI";
    const sendBody = body || "Olá,\n\nMensagem enviada com o Samuel AI.\n\nCumprimentos";
    if (!email) {
      return plan(
        "gmail_inbox",
        { maxResults: 5 },
        "Destinatário em falta",
        "Indique o e-mail do destinatário (ex.: enviar para nome@empresa.com).",
      );
    }
    if (/\b(rascunho|draft)\b/.test(normalized)) {
      return plan(
        "gmail_draft",
        { to: email, subject, body: sendBody },
        "Criar rascunho",
        `Criar rascunho para ${email} — ${subject}`,
      );
    }
    return plan(
      "gmail_send",
      { to: email, subject, body: sendBody },
      "Enviar e-mail",
      `Enviar e-mail para ${email} — assunto: ${subject}`,
    );
  }

  if (/\b(rascunho|draft)\b/.test(normalized) && email) {
    const subject = "Rascunho do Samuel AI";
    return plan(
      "gmail_draft",
      { to: email, subject, body: body || "Rascunho criado pelo Samuel AI." },
      "Criar rascunho",
      `Criar rascunho para ${email}.`,
    );
  }

  if (/\b(abrir|ler|leia|mostra|mostrar|conteudo|conteúdo)\b/.test(normalized) && messageId) {
    return plan("gmail_read", { messageId }, "Ler e-mail", `Abrir o conteúdo da mensagem ${messageId}.`);
  }

  if (/\b(nao lido|não lido|unread)\b/.test(normalized) && !/\bmarcar\b/.test(normalized)) {
    return plan(
      "gmail_unread_count",
      {},
      "Contar não lidos",
      "Consultar quantos e-mails não lidos existem na inbox.",
    );
  }

  if (/\b(procur|busca|search|encontrar)\b/.test(normalized)) {
    const q =
      query.replace(/.*(?:procur|busca|search|encontrar)\s+/i, "").trim() || "in:inbox";
    return plan("gmail_search", { query: q, maxResults: 8 }, "Pesquisar e-mails", `Pesquisar: ${q}`);
  }

  if (/\b(inbox|caixa|e-?mails?|mensagens?|gmail)\b/.test(normalized)) {
    return plan(
      "gmail_inbox",
      { maxResults: 8, query: /\bnao lido|não lido|unread\b/.test(normalized) ? "is:unread" : undefined },
      "Listar inbox",
      "Listar os e-mails mais recentes da caixa de entrada.",
    );
  }

  return null;
}
