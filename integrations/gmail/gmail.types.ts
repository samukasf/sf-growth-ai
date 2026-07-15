export type GmailErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_CONNECTED"
  | "INVALID_STATE"
  | "TOKEN_EXCHANGE_FAILED"
  | "TOKEN_REFRESH_FAILED"
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_COMPANY_ID"
  | "UNKNOWN";

export class GmailApiError extends Error {
  readonly code: GmailErrorCode;
  readonly status?: number;

  constructor(
    code: GmailErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "GmailApiError";
    this.code = code;
    this.status = options?.status;
  }
}

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

/** Linha persistida em `public.google_oauth_connections`. */
export type GoogleOAuthConnection = {
  id: string;
  companyId: string;
  googleEmail: string | null;
  scope: string;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string;
  connectedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Payload persistido/atualizado ao (re)conectar uma empresa. */
export type UpsertGoogleOAuthConnectionInput = {
  companyId: string;
  googleEmail: string | null;
  scope: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  connectedBy?: string | null;
};

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export type GmailMessageSummary = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  unread: boolean;
};

export type GmailMessage = GmailMessageSummary & {
  to: string;
  body: string;
};

export type GmailInboxSummary = {
  emailAddress: string;
  unreadCount: number;
  messages: GmailMessageSummary[];
};

export type GmailSendInput = {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
};

export type GmailReplyInput = {
  messageId: string;
  body: string;
};

export type GmailDraftResult = {
  draftId: string;
  messageId: string;
  threadId: string;
};

export type GmailSendResult = {
  messageId: string;
  threadId: string;
};

