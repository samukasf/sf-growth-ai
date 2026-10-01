import { describe, expect, it } from "vitest";

import { SAMUEL_CINEMATIC_BEHAVIOR } from "./samuel-cinematic-profile";

describe("Samuel cinematic behavior", () => {
  it("keeps humor restrained and execution evidence-bound", () => {
    expect(SAMUEL_CINEMATIC_BEHAVIOR).toContain("Humor");
    expect(SAMUEL_CINEMATIC_BEHAVIOR).toContain("Nunca diga 'feito'");
    expect(SAMUEL_CINEMATIC_BEHAVIOR).toContain("Em voz");
  });
});
