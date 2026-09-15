import { afterEach, describe, expect, it } from "vitest";

import { GMAIL_OAUTH_SCOPES, resolveGoogleOAuthRedirectUri } from "./gmail.auth";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("Google OAuth scope bundle", () => {
  it("keeps Workspace, Business Profile and marketing permissions without Maps 3LO scopes", () => {
    const scopes = new Set(GMAIL_OAUTH_SCOPES.split(" "));

    expect(scopes.size).toBeGreaterThanOrEqual(12);
    expect(scopes.has("https://www.googleapis.com/auth/gmail.modify")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/calendar")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/business.manage")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/adwords")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/analytics.readonly")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/webmasters.readonly")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/youtube.readonly")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/maps-platform.places")).toBe(false);
    expect(scopes.has("https://www.googleapis.com/auth/maps-platform.geocode")).toBe(false);
  });
});

describe("Google OAuth redirect URI", () => {
  it("never sends a production user back to localhost", () => {
    process.env.VERCEL_ENV = "production";
    process.env.GOOGLE_OAUTH_REDIRECT_URI = "http://localhost:3000/api/integrations/gmail/callback";
    delete process.env.SF_GROWTH_AI_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    expect(resolveGoogleOAuthRedirectUri()).toBe(
      "https://sf-growth-ai.vercel.app/api/integrations/google/oauth/callback",
    );
  });

  it("uses the Vercel production hostname when available", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "sf-growth-ai.vercel.app";
    process.env.GOOGLE_OAUTH_REDIRECT_URI = "http://localhost:3000/api/integrations/gmail/callback";

    expect(resolveGoogleOAuthRedirectUri()).toBe(
      "https://sf-growth-ai.vercel.app/api/integrations/google/oauth/callback",
    );
  });

  it("keeps the explicit callback for local development", () => {
    process.env.VERCEL_ENV = "development";
    process.env.GOOGLE_OAUTH_REDIRECT_URI = "http://localhost:3000/api/integrations/google/oauth/callback";

    expect(resolveGoogleOAuthRedirectUri()).toBe(
      "http://localhost:3000/api/integrations/google/oauth/callback",
    );
  });
});
