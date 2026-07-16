import {
  exchangeGmailAuthorizationCode,
  refreshGmailAccessToken,
  resolveGoogleOAuthConfig,
} from "./gmail.auth";
import {
  findGoogleOAuthConnection,
  updateGoogleOAuthAccessToken,
  upsertGoogleOAuthConnection,
} from "./gmail-token.repository";
import { GmailApiError } from "./gmail.types";
import type {
  GmailDraftResult,
  GmailInboxSummary,
  GmailMessage,
  GmailMessageSummary,
  GmailReplyInput,
  GmailSendInput,
  GmailSendResult,
  GoogleOAuthConnection,
} from "./gmail.types";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

/** Margem de segurança antes de considerar o access_token expirado. */
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

function isExpired(connection: GoogleOAuthConnection): boolean {
  if (!connection.accessToken || !connection.accessTokenExpiresAt) return true;
  const expiresAt = new Date(connection.accessTokenExpiresAt).getTime();
  return Number.isNaN(expiresAt) || expiresAt - EXPIRY_SAFETY_MARGIN_MS <= Date.now();
}

/**
 * Resolve um access_token válido para a empresa, renovando via refresh_token
 * automaticamente quando necessário. Lançado a cada chamada real ao Gmail —
 * nunca reaproveita um token expirado.
 */
export async function resolveGmailAccessToken(companyId: string): Promise<string> {
  const config = resolveGoogleOAuthConfig();
  if (!config) {
    throw new GmailApiError(
      "NOT_CONFIGURED",
      "Integração Gmail não configurada (variáveis de ambiente do Google OAuth ausentes).",
    );
  }

  const connection = await findGoogleOAuthConnection(companyId);
  if (!connection) {
    throw new GmailApiError(
      "NOT_CONNECTED",
      `Nenhuma conta Gmail conectada para a empresa "${companyId}". Conecte em /integrations/google/connect.`,
    );
  }

  if (!isExpired(connection)) {
    return connection.accessToken as string;
  }

  const refreshed = await refreshGmailAccessToken(connection.refreshToken, config);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await updateGoogleOAuthAccessToken(companyId, refreshed.access_token, expiresAt);

  return refreshed.access_token;
}

function mapHttpError(status: number, body: string): never {
  if (status === 401) {
    throw new GmailApiError(
      "AUTH_ERROR",
      "Token de acesso do Gmail expirado ou inválido — pode ser necessário reconectar a conta.",
      { status },
    );
  }
  if (status === 403) {
    throw new GmailApiError(
      "AUTH_ERROR",
      "Permissões insuficientes para esta operação no Gmail (verifique os scopes concedidos).",
      { status },
    );
  }
  throw new GmailApiError("UNKNOWN", `Erro na Gmail API (status ${status}): ${body}`, { status });
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function findHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function buildMimeMessage(input: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const lines = [
    `To: ${input.to}`,
    ...(input.cc ? [`Cc: ${input.cc}`] : []),
    ...(input.bcc ? [`Bcc: ${input.bcc}`] : []),
    `Subject: ${input.subject}`,
    ...(input.inReplyTo ? [`In-Reply-To: ${input.inReplyTo}`] : []),
    ...(input.references ? [`References: ${input.references}`] : []),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body,
  ];
  return lines.join("\r\n");
}

export class GmailClient {
  constructor(private readonly accessToken: string) {}

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> },
  ): Promise<T> {
    const url = new URL(`${GMAIL_API_BASE}${path}`);
    if (init?.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: init?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
        body: init?.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
      });
    } catch (error) {
      throw new GmailApiError("NETWORK_ERROR", "Falha de rede ao consultar a Gmail API.", {
        cause: error,
      });
    }

    if (!response.ok) {
      mapHttpError(response.status, await response.text());
    }

    return (await response.json()) as T;
  }

  async getProfile(): Promise<{ emailAddress: string }> {
    return this.request<{ emailAddress: string }>("/profile");
  }

  async listMessages(options?: {
    maxResults?: number;
    labelIds?: string[];
    query?: string;
  }): Promise<GmailMessageSummary[]> {
    const list = await this.request<{ messages?: Array<{ id: string; threadId: string }> }>(
      "/messages",
      {
        query: {
          maxResults: options?.maxResults ?? 10,
          labelIds: options?.labelIds?.join(","),
          q: options?.query,
        },
      },
    );

    const ids = list.messages ?? [];
    return Promise.all(ids.map((item) => this.getMessageSummary(item.id)));
  }

  async searchMessages(query: string, maxResults = 10): Promise<GmailMessageSummary[]> {
    return this.listMessages({ query, maxResults });
  }

  async getUnreadCount(): Promise<number> {
    const unread = await this.request<{ resultSizeEstimate?: number }>("/messages", {
      query: { q: "in:inbox is:unread", maxResults: 1 },
    });

    return unread.resultSizeEstimate ?? 0;
  }

  private async getRawMessage(id: string): Promise<{
    id: string;
    threadId: string;
    snippet: string;
    labelIds?: string[];
    payload: { headers: Array<{ name: string; value: string }>; body?: { data?: string }; parts?: Array<{ mimeType: string; body?: { data?: string } }> };
  }> {
    return this.request(`/messages/${id}`, { query: { format: "full" } });
  }

  async getMessageSummary(id: string): Promise<GmailMessageSummary> {
    const message = await this.getRawMessage(id);
    const headers = message.payload.headers ?? [];
    return {
      id: message.id,
      threadId: message.threadId,
      subject: findHeader(headers, "Subject"),
      from: findHeader(headers, "From"),
      snippet: message.snippet,
      date: findHeader(headers, "Date"),
      unread: (message.labelIds ?? []).includes("UNREAD"),
    };
  }

  async getMessage(id: string): Promise<GmailMessage> {
    const message = await this.getRawMessage(id);
    const headers = message.payload.headers ?? [];

    const plainTextPart =
      message.payload.body?.data ??
      message.payload.parts?.find((part) => part.mimeType === "text/plain")?.body?.data;

    return {
      id: message.id,
      threadId: message.threadId,
      subject: findHeader(headers, "Subject"),
      from: findHeader(headers, "From"),
      to: findHeader(headers, "To"),
      snippet: message.snippet,
      date: findHeader(headers, "Date"),
      unread: (message.labelIds ?? []).includes("UNREAD"),
      body: plainTextPart ? base64UrlDecode(plainTextPart) : message.snippet,
    };
  }

  async getInboxSummary(maxResults = 10): Promise<GmailInboxSummary> {
    const [profile, messages, unread] = await Promise.all([
      this.getProfile(),
      this.listMessages({ labelIds: ["INBOX"], maxResults }),
      this.request<{ resultSizeEstimate?: number }>("/messages", {
        query: { q: "in:inbox is:unread", maxResults: 1 },
      }),
    ]);

    return {
      emailAddress: profile.emailAddress,
      unreadCount: unread.resultSizeEstimate ?? 0,
      messages,
    };
  }

  async createDraft(input: { to: string; subject: string; body: string; cc?: string; bcc?: string }): Promise<GmailDraftResult> {
    const raw = base64UrlEncode(buildMimeMessage(input));
    const draft = await this.request<{ id: string; message: { id: string; threadId: string } }>(
      "/drafts",
      { method: "POST", body: { message: { raw } } },
    );
    return { draftId: draft.id, messageId: draft.message.id, threadId: draft.message.threadId };
  }

  async createReplyDraft(input: GmailReplyInput): Promise<GmailDraftResult> {
    const original = await this.getRawMessage(input.messageId);
    const headers = original.payload.headers ?? [];
    const subject = findHeader(headers, "Subject");
    const from = findHeader(headers, "From");
    const messageIdHeader = findHeader(headers, "Message-ID");

    const raw = base64UrlEncode(
      buildMimeMessage({
        to: from,
        subject: subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`,
        body: input.body,
        inReplyTo: messageIdHeader,
        references: messageIdHeader,
      }),
    );

    const draft = await this.request<{ id: string; message: { id: string; threadId: string } }>(
      "/drafts",
      { method: "POST", body: { message: { raw, threadId: original.threadId } } },
    );
    return { draftId: draft.id, messageId: draft.message.id, threadId: draft.message.threadId };
  }

  async sendMessage(input: GmailSendInput): Promise<GmailSendResult> {
    const raw = base64UrlEncode(buildMimeMessage(input));
    const sent = await this.request<{ id: string; threadId: string }>("/messages/send", {
      method: "POST",
      body: { raw },
    });
    return { messageId: sent.id, threadId: sent.threadId };
  }

  async replyToMessage(input: GmailReplyInput): Promise<GmailSendResult> {
    const original = await this.getRawMessage(input.messageId);
    const headers = original.payload.headers ?? [];
    const subject = findHeader(headers, "Subject");
    const from = findHeader(headers, "From");
    const messageIdHeader = findHeader(headers, "Message-ID");

    const raw = base64UrlEncode(
      buildMimeMessage({
        to: from,
        subject: subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`,
        body: input.body,
        inReplyTo: messageIdHeader,
        references: messageIdHeader,
      }),
    );

    const sent = await this.request<{ id: string; threadId: string }>("/messages/send", {
      method: "POST",
      body: { raw, threadId: original.threadId },
    });
    return { messageId: sent.id, threadId: sent.threadId };
  }
}

/** Factory principal: resolve o token da empresa e devolve um client autenticado. */
export async function getGmailClientForCompany(companyId: string): Promise<GmailClient> {
  const accessToken = await resolveGmailAccessToken(companyId);
  return new GmailClient(accessToken);
}

/**
 * Finaliza o fluxo de OAuth: troca o `code` por tokens, descobre o e-mail
 * conectado e persiste a conexão. Usado exclusivamente pela rota de callback.
 */
export async function completeGmailOAuthConnection(
  code: string,
  companyId: string,
  connectedBy?: string | null,
): Promise<GoogleOAuthConnection> {
  const config = resolveGoogleOAuthConfig();
  if (!config) {
    throw new GmailApiError("NOT_CONFIGURED", "Integração Gmail não configurada.");
  }

  const tokenResponse = await exchangeGmailAuthorizationCode(code, config);
  if (!tokenResponse.refresh_token) {
    throw new GmailApiError(
      "TOKEN_EXCHANGE_FAILED",
      "Google não retornou refresh_token — reconecte a conta garantindo access_type=offline e prompt=consent.",
    );
  }

  const client = new GmailClient(tokenResponse.access_token);
  const profile = await client.getProfile();

  const accessTokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();

  return upsertGoogleOAuthConnection({
    companyId,
    googleEmail: profile.emailAddress,
    scope: tokenResponse.scope,
    accessToken: tokenResponse.access_token,
    accessTokenExpiresAt,
    refreshToken: tokenResponse.refresh_token,
    connectedBy: connectedBy ?? null,
  });
}
