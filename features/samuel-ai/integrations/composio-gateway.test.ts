import { describe, expect, it } from "vitest";

import {
  composioEntityId,
  composioGatewayReadiness,
} from "./composio-gateway.server";

describe("Samuel Composio integration gateway", () => {
  it("derives a stable external entity id without exposing the raw account id", () => {
    const first = composioEntityId("user-secret-123", "company-456");
    const second = composioEntityId("user-secret-123", "company-456");

    expect(first).toBe(second);
    expect(first).toMatch(/^sf_[a-f0-9]{36}$/);
    expect(first).not.toContain("user-secret-123");
    expect(first).not.toContain("company-456");
  });

  it("reports configuration without exposing the key", () => {
    const previous = process.env.COMPOSIO_API_KEY;
    process.env.COMPOSIO_API_KEY = "never-expose-this";
    try {
      const readiness = composioGatewayReadiness();
      expect(readiness.configured).toBe(true);
      expect(JSON.stringify(readiness)).not.toContain("never-expose-this");
    } finally {
      if (previous === undefined) delete process.env.COMPOSIO_API_KEY;
      else process.env.COMPOSIO_API_KEY = previous;
    }
  });
});
