export {
  GMAIL_OAUTH_SCOPES,
  buildGmailOAuthAuthorizeUrl,
  exchangeGmailAuthorizationCode,
  refreshGmailAccessToken,
  resolveGoogleOAuthConfig,
  signGmailOAuthState,
  verifyGmailOAuthState,
} from "./gmail.auth";

export {
  GmailClient,
  completeGmailOAuthConnection,
  getGmailClientForCompany,
  resolveGmailAccessToken,
} from "./gmail.client";

export {
  findGoogleOAuthConnection,
  updateGoogleOAuthAccessToken,
  upsertGoogleOAuthConnection,
} from "./gmail-token.repository";

export { GmailApiError } from "./gmail.types";
export type {
  GmailDraftResult,
  GmailErrorCode,
  GmailInboxSummary,
  GmailMessage,
  GmailMessageSummary,
  GmailReplyInput,
  GmailSendInput,
  GmailSendResult,
  GoogleOAuthConfig,
  GoogleOAuthConnection,
  GoogleTokenResponse,
  UpsertGoogleOAuthConnectionInput,
} from "./gmail.types";
