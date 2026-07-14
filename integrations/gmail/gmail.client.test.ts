import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

const findGoogleOAuthConnectionMock = vi.fn();
const updateGoogleOAuthAccessTokenMock = vi.fn();
const upsertGoogleOAuthConnectionMock = vi.fn();

vi.mock("./gmail-token.repository", () => ({
  findGoogleOAuthConnection: findGoogleOAuthConnectionMock,
  updateGoogleOAuthAccessToken: updateGoogleOAuthAccessTokenMock,
  upsertGoogleOAuthConnection: upsertGoogleOAuthConnectionMock,
}));

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

describe("gmail.client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    findGoogleOAuthConnectionMock.mockReset();
    updateGoogleOAuthAccessTokenMock.mockReset();
    upsertGoogleOAuthConnectionMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  describe("resolveGmailAccessToken", () => {
    it("lança NOT_CONFIGURED quando integração não está configurada", async () => {
      clearGoogleEnv();
      const { resolveGmailAccessToken } = await import("./gmail.client");
      await expect(resolveGmailAccessToken(VALID_COMPANY_ID)).rejects.toMatchObject({
        code: "NOT_CONFIGURED",
      });
    });

    it("lança NOT_CONNECTED quando não há conexão salva para a empresa", async () => {
      setGoogleEnv();
      findGoogleOAuthConnectionMock.mockResolvedValue(null);
      const { resolveGmailAccessToken } = await import("./gmail.client");

      await expect(resolveGmailAccessToken(VALID_COMPANY_ID)).rejects.toMatchObject({
        code: "NOT_CONNECTED",
      });
    });

    it("reutiliza o access_token salvo quando ainda não expirou", async () => {
      setGoogleEnv();
      findGoogleOAuthConnectionMock.mockResolvedValue({
        accessToken: "access-valido",
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refreshToken: "refresh-1",
      });
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const { resolveGmailAccessToken } = await import("./gmail.client");
      const token = await resolveGmailAccessToken(VALID_COMPANY_ID);

      expect(token).toBe("access-valido");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("renova o access_token via refresh_token quando expirado e persiste o novo token", async () => {
      setGoogleEnv();
      findGoogleOAuthConnectionMock.mockResolvedValue({
        accessToken: "access-expirado",
        accessTokenExpiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
        refreshToken: "refresh-1",
      });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "access-novo",
          expires_in: 3600,
          scope: "gmail.readonly",
          token_type: "Bearer",
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const { resolveGmailAccessToken } = await import("./gmail.client");
      const token = await resolveGmailAccessToken(VALID_COMPANY_ID);

      expect(token).toBe("access-novo");
      expect(updateGoogleOAuthAccessTokenMock).toHaveBeenCalledWith(
        VALID_COMPANY_ID,
        "access-novo",
        expect.any(String),
      );
    });
  });

  describe("GmailClient", () => {
    it("getProfile chama /profile e devolve o e-mail", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ emailAddress: "empresa@gmail.com" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const { GmailClient } = await import("./gmail.client");
      const client = new GmailClient("token-abc");
      const profile = await client.getProfile();

      expect(profile.emailAddress).toBe("empresa@gmail.com");
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain("/gmail/v1/users/me/profile");
      expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
    });

    it("mapeia erro 401 da Gmail API para GmailApiError AUTH_ERROR", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "invalid credentials",
      });
      vi.stubGlobal("fetch", fetchMock);

      const { GmailClient } = await import("./gmail.client");
      const client = new GmailClient("token-expirado");

      await expect(client.getProfile()).rejects.toMatchObject({ code: "AUTH_ERROR" });
    });

    it("getInboxSummary combina profile real + mensagens reais do INBOX + contagem de não lidas (prova de funcionamento)", async () => {
      const fetchMock = vi.fn(async (input: string) => {
        const url = new URL(input);

        if (url.pathname.endsWith("/profile")) {
          return { ok: true, json: async () => ({ emailAddress: "empresa@gmail.com" }) };
        }

        if (url.pathname.endsWith("/messages") && url.searchParams.get("q")) {
          return { ok: true, json: async () => ({ resultSizeEstimate: 3 }) };
        }

        if (url.pathname.endsWith("/messages")) {
          return { ok: true, json: async () => ({ messages: [{ id: "m1", threadId: "t1" }] }) };
        }

        if (url.pathname.endsWith("/messages/m1")) {
          return {
            ok: true,
            json: async () => ({
              id: "m1",
              threadId: "t1",
              snippet: "trecho da mensagem",
              labelIds: ["INBOX", "UNREAD"],
              payload: {
                headers: [
                  { name: "Subject", value: "Assunto real" },
                  { name: "From", value: "cliente@empresa.com" },
                  { name: "Date", value: "2026-07-12" },
                ],
              },
            }),
          };
        }

        throw new Error(`URL não mapeada no mock: ${input}`);
      });
      vi.stubGlobal("fetch", fetchMock);

      const { GmailClient } = await import("./gmail.client");
      const client = new GmailClient("token-abc");
      const summary = await client.getInboxSummary(5);

      expect(summary.emailAddress).toBe("empresa@gmail.com");
      expect(summary.unreadCount).toBe(3);
      expect(summary.messages).toHaveLength(1);
      expect(summary.messages[0]).toMatchObject({
        id: "m1",
        subject: "Assunto real",
        from: "cliente@empresa.com",
        unread: true,
      });
    });

    it("sendMessage monta a mensagem MIME em base64url e envia para /messages/send", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "msg-1", threadId: "thread-1" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const { GmailClient } = await import("./gmail.client");
      const client = new GmailClient("token-abc");
      const result = await client.sendMessage({
        to: "destino@example.com",
        subject: "Assunto",
        body: "Corpo do e-mail",
      });

      expect(result).toEqual({ messageId: "msg-1", threadId: "thread-1" });
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain("/messages/send");
      expect(init.method).toBe("POST");

      const body = JSON.parse(init.body as string) as { raw: string };
      const decoded = Buffer.from(body.raw, "base64url").toString("utf8");
      expect(decoded).toContain("To: destino@example.com");
      expect(decoded).toContain("Subject: Assunto");
      expect(decoded).toContain("Corpo do e-mail");
    });
  });
});
