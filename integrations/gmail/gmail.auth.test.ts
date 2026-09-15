import { describe, expect, it } from "vitest";

import { GMAIL_OAUTH_SCOPES } from "./gmail.auth";

describe("Google OAuth scope bundle", () => {
  it("keeps workspace, local and marketing capabilities in one reconnect flow", () => {
    const scopes = new Set(GMAIL_OAUTH_SCOPES.split(" "));

    expect(scopes).toEqual(
      expect.objectContaining({
        size: expect.any(Number),
      }),
    );
    expect(scopes.has("https://www.googleapis.com/auth/gmail.modify")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/calendar")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/business.manage")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/adwords")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/analytics.readonly")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/webmasters.readonly")).toBe(true);
    expect(scopes.has("https://www.googleapis.com/auth/youtube.readonly")).toBe(true);
  });
});
