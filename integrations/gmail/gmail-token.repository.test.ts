import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/service-client", () => ({
  getSupabaseServiceClient: () => ({ from: fromMock }),
}));

const {
  findGoogleOAuthConnection,
  updateGoogleOAuthAccessToken,
  upsertGoogleOAuthConnection,
} = await import("./gmail-token.repository");
const { GmailApiError } = await import("./gmail.types");

const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

describe("gmail-token.repository", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  describe("findGoogleOAuthConnection", () => {
    it("lança INVALID_COMPANY_ID quando companyId não é UUID", async () => {
      await expect(findGoogleOAuthConnection("default-company")).rejects.toThrow(GmailApiError);
      expect(fromMock).not.toHaveBeenCalled();
    });

    it("devolve null quando não há conexão salva", async () => {
      fromMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      });

      const result = await findGoogleOAuthConnection(VALID_COMPANY_ID);
      expect(result).toBeNull();
      expect(fromMock).toHaveBeenCalledWith("google_oauth_connections");
    });

    it("mapeia a row do banco para GoogleOAuthConnection", async () => {
      fromMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "conn-1",
                company_id: VALID_COMPANY_ID,
                google_email: "empresa@gmail.com",
                scope: "gmail.readonly",
                access_token: "access-1",
                access_token_expires_at: "2026-07-12T00:00:00.000Z",
                refresh_token: "refresh-1",
                connected_by: null,
                created_at: "2026-07-01T00:00:00.000Z",
                updated_at: "2026-07-01T00:00:00.000Z",
              },
              error: null,
            }),
          })),
        })),
      });

      const result = await findGoogleOAuthConnection(VALID_COMPANY_ID);
      expect(result?.googleEmail).toBe("empresa@gmail.com");
      expect(result?.refreshToken).toBe("refresh-1");
    });

    it("propaga erro do Supabase como GmailApiError", async () => {
      fromMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }),
          })),
        })),
      });

      await expect(findGoogleOAuthConnection(VALID_COMPANY_ID)).rejects.toThrow(GmailApiError);
    });
  });

  describe("upsertGoogleOAuthConnection", () => {
    it("faz upsert com onConflict company_id e devolve a conexão salva", async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: {
          id: "conn-1",
          company_id: VALID_COMPANY_ID,
          google_email: "empresa@gmail.com",
          scope: "gmail.readonly gmail.send",
          access_token: "access-1",
          access_token_expires_at: "2026-07-12T00:00:00.000Z",
          refresh_token: "refresh-1",
          connected_by: null,
          created_at: "2026-07-01T00:00:00.000Z",
          updated_at: "2026-07-01T00:00:00.000Z",
        },
        error: null,
      });
      const selectMock = vi.fn(() => ({ single: singleMock }));
      const upsertMock = vi.fn(() => ({ select: selectMock }));
      fromMock.mockReturnValue({ upsert: upsertMock });

      const result = await upsertGoogleOAuthConnection({
        companyId: VALID_COMPANY_ID,
        googleEmail: "empresa@gmail.com",
        scope: "gmail.readonly gmail.send",
        accessToken: "access-1",
        accessTokenExpiresAt: "2026-07-12T00:00:00.000Z",
        refreshToken: "refresh-1",
      });

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ company_id: VALID_COMPANY_ID, refresh_token: "refresh-1" }),
        { onConflict: "company_id" },
      );
      expect(result.googleEmail).toBe("empresa@gmail.com");
    });
  });

  describe("updateGoogleOAuthAccessToken", () => {
    it("atualiza access_token e access_token_expires_at para a empresa", async () => {
      const eqMock = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn(() => ({ eq: eqMock }));
      fromMock.mockReturnValue({ update: updateMock });

      await updateGoogleOAuthAccessToken(VALID_COMPANY_ID, "novo-access", "2026-07-12T01:00:00.000Z");

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ access_token: "novo-access" }),
      );
      expect(eqMock).toHaveBeenCalledWith("company_id", VALID_COMPANY_ID);
    });
  });
});
