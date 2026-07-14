import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GMAIL_OAUTH_SCOPES, buildGmailOAuthAuthorizeUrl } from "@/integrations/gmail/gmail.auth";
import { findGoogleOAuthConnection } from "@/integrations/gmail/gmail-token.repository";

import { getGoogleDriveProviderForCompany } from "./google-drive.provider";

function loadEnvLocal(force = false) {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (force || !process.env[key]) process.env[key] = value;
  }
}

const RUN_OPS = process.env.RUN_GOOGLE_DRIVE_OPS_VALIDATION === "true";
const COMPANY_ID = process.env.COMPANY_ID ?? "dc8a6425-e184-4730-9b9d-df4e999e5b61";

describe.skipIf(!RUN_OPS)("Google Drive — validação operacional", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    loadEnvLocal(true);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("inclui drive.readonly nos scopes OAuth", () => {
    expect(GMAIL_OAUTH_SCOPES).toContain("drive.readonly");

    if (
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    ) {
      const url = new URL(buildGmailOAuthAuthorizeUrl(COMPANY_ID));
      expect(url.searchParams.get("scope")).toContain("drive.readonly");
    }
  });

  it("lista arquivos reais quando OAuth está conectado", async () => {
    const connection = await findGoogleOAuthConnection(COMPANY_ID);
    if (!connection) {
      throw new Error(
        `Nenhuma conexão OAuth para companyId=${COMPANY_ID}. Reconecte em /debug/gmail-connect.`,
      );
    }

    if (!connection.scope.includes("drive.readonly")) {
      throw new Error(
        `OAuth conectado sem scope drive.readonly (scopes atuais: ${connection.scope}). ` +
          "Reconecte em http://localhost:3000/debug/gmail-connect após ativar Google Drive API no GCP.",
      );
    }

    const provider = await getGoogleDriveProviderForCompany(COMPANY_ID);
    const files = await provider.listRecent(5);

    expect(Array.isArray(files)).toBe(true);
  }, 30_000);
});

describe("Google Drive — validação operacional (offline)", () => {
  it("documenta scope drive.readonly no código", () => {
    expect(GMAIL_OAUTH_SCOPES).toContain("https://www.googleapis.com/auth/drive.readonly");
  });
});
