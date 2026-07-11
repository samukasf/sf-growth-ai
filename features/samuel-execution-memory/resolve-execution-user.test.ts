import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: { auth: { getUser: getUserMock } },
}));

const { resolveExecutionUserId } = await import("./resolve-execution-user");

let originalNodeEnv: string | undefined;

beforeEach(() => {
  originalNodeEnv = process.env.NODE_ENV;
  getUserMock.mockReset();
});

afterEach(() => {
  vi.stubEnv("NODE_ENV", originalNodeEnv ?? "test");
});

describe("resolveExecutionUserId", () => {
  it("prioriza a sessão autenticada (Bearer token válido)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-real-123" } }, error: null });

    const result = await resolveExecutionUserId({
      authorizationHeader: "Bearer valid-token",
      fallbackUserId: "dev-user-should-be-ignored",
    });

    expect(result).toBe("user-real-123");
    expect(getUserMock).toHaveBeenCalledWith("valid-token");
  });

  it("usa fallbackUserId fora de produção quando não há sessão autenticada", async () => {
    vi.stubEnv("NODE_ENV", "development");
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const result = await resolveExecutionUserId({ fallbackUserId: "dev-user-1" });

    expect(result).toBe("dev-user-1");
  });

  it("nunca usa fallbackUserId em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const result = await resolveExecutionUserId({ fallbackUserId: "dev-user-1" });

    expect(result).toBeNull();
  });

  it("retorna null quando não há token nem fallback", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const result = await resolveExecutionUserId({});

    expect(result).toBeNull();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("não lança quando a validação do token falha — cai para o fallback", async () => {
    vi.stubEnv("NODE_ENV", "development");
    getUserMock.mockRejectedValue(new Error("network down"));

    const result = await resolveExecutionUserId({
      authorizationHeader: "Bearer broken-token",
      fallbackUserId: "dev-user-2",
    });

    expect(result).toBe("dev-user-2");
  });
});
