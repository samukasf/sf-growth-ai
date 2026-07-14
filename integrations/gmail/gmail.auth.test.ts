import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildGmailOAuthAuthorizeUrl,
  exchangeGmailAuthorizationCode,
  refreshGmailAccessToken,
  resolveGoogleOAuthConfig,
  signGmailOAuthState,
  verifyGmailOAuthState,
} from "./gmail.auth";
import { GmailApiError } from "./gmail.types";

const ORIGINAL_ENV = { ...process.env };

function setGoogleEnv() {
  process.env.GOOGLE_CLIENT_ID = "client-id-123";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret-abc";
  process.env.GOOGLE_OAUTH_REDIRECT_URI = "http://localhost:3000/api/integrations/gmail/callback";
}

function clearGoogleEnv() {
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_OAUTH_REDIRECT_URI;
}

describe("gmail.auth", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it("resolveGoogleOAuthConfig devolve null quando faltam variáveis de ambiente", () => {
    clearGoogleEnv();
    expect(resolveGoogleOAuthConfig()).toBeNull();
  });

  it("resolveGoogleOAuthConfig devolve config completa quando tudo está configurado", () => {
    setGoogleEnv();
    expect(resolveGoogleOAuthConfig()).toEqual({
      clientId: "client-id-123",
      clientSecret: "client-secret-abc",
      redirectUri: "http://localhost:3000/api/integrations/gmail/callback",
    });
  });

  it("assina e verifica o state corretamente, devolvendo o companyId original", () => {
    setGoogleEnv();
    const config = resolveGoogleOAuthConfig()!;

    const state = signGmailOAuthState("company-42", config);
    expect(verifyGmailOAuthState(state, config)).toBe("company-42");
  });

  it("verifyGmailOAuthState rejeita state assinado com outra chave (adulterado)", () => {
    setGoogleEnv();
    const config = resolveGoogleOAuthConfig()!;

    const stateSignedElsewhere = signGmailOAuthState("company-42", {
      ...config,
      clientSecret: "outra-chave",
    });

    expect(() => verifyGmailOAuthState(stateSignedElsewhere, config)).toThrow(GmailApiError);
  });

  it("verifyGmailOAuthState rejeita state malformado", () => {
    setGoogleEnv();
    const config = resolveGoogleOAuthConfig()!;

    expect(() => verifyGmailOAuthState("sem-ponto-separador", config)).toThrow(GmailApiError);
  });

  it("buildGmailOAuthAuthorizeUrl lança NOT_CONFIGURED quando integração não está configurada", () => {
    clearGoogleEnv();
    expect(() => buildGmailOAuthAuthorizeUrl("company-1")).toThrow(GmailApiError);
  });

  it("buildGmailOAuthAuthorizeUrl monta a URL com scopes, access_type=offline e prompt=consent", () => {
    setGoogleEnv();
    const url = new URL(buildGmailOAuthAuthorizeUrl("company-99"));

    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("client-id-123");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("scope")).toContain("gmail.readonly");
    expect(url.searchParams.get("scope")).toContain("gmail.compose");
    expect(url.searchParams.get("scope")).toContain("gmail.send");
    expect(url.searchParams.get("scope")).toContain("drive.readonly");

    const state = url.searchParams.get("state")!;
    expect(verifyGmailOAuthState(state, resolveGoogleOAuthConfig()!)).toBe("company-99");
  });

  it("exchangeGmailAuthorizationCode envia grant_type=authorization_code e devolve tokens", async () => {
    setGoogleEnv();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "access-1",
        expires_in: 3600,
        refresh_token: "refresh-1",
        scope: "gmail.readonly",
        token_type: "Bearer",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await exchangeGmailAuthorizationCode("code-abc", resolveGoogleOAuthConfig()!);

    expect(result.access_token).toBe("access-1");
    expect(result.refresh_token).toBe("refresh-1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    const body = new URLSearchParams(init.body as string);
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code-abc");
  });

  it("exchangeGmailAuthorizationCode lança TOKEN_EXCHANGE_FAILED quando o Google responde com erro", async () => {
    setGoogleEnv();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "invalid_grant",
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      exchangeGmailAuthorizationCode("code-abc", resolveGoogleOAuthConfig()!),
    ).rejects.toThrow(GmailApiError);
  });

  it("refreshGmailAccessToken envia grant_type=refresh_token e devolve novo access_token", async () => {
    setGoogleEnv();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "access-2",
        expires_in: 3600,
        scope: "gmail.readonly",
        token_type: "Bearer",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshGmailAccessToken("refresh-1", resolveGoogleOAuthConfig()!);

    expect(result.access_token).toBe("access-2");
    const [, init] = fetchMock.mock.calls[0];
    const body = new URLSearchParams(init.body as string);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("refresh-1");
  });

  it("refreshGmailAccessToken lança TOKEN_REFRESH_FAILED quando o refresh_token é inválido", async () => {
    setGoogleEnv();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "invalid_grant",
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      refreshGmailAccessToken("refresh-invalido", resolveGoogleOAuthConfig()!),
    ).rejects.toMatchObject({ code: "TOKEN_REFRESH_FAILED" });
  });
});
