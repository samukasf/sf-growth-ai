import { describe, expect, it } from "vitest";

import {
  buildSamuelMission,
  finalizeSamuelMission,
  shouldDiscoverLocalBusinesses,
  shouldOpenSiteBuilder,
  updateSamuelMissionStep,
} from "./samuel-mission";

describe("Samuel Missions", () => {
  it("creates a real lead discovery step from a natural request", () => {
    expect(shouldDiscoverLocalBusinesses("Procure empresas de mudanças em Lisboa")).toBe(true);
    const mission = buildSamuelMission(
      "Procure empresas de mudanças em Lisboa",
      [{ id: "research", name: "Pesquisa", risk: "read" }],
      new Date("2026-10-03T18:00:00Z"),
    );

    expect(mission.steps.map((step) => step.skillId)).toContain("lead-discovery");
    expect(mission.steps.map((step) => step.skillId)).toContain("research");
  });

  it("deduplicates research skills and recognizes site creation", () => {
    expect(shouldOpenSiteBuilder("Crie um site premium para a minha empresa")).toBe(true);
    const mission = buildSamuelMission("Crie um site premium", [
      { id: "live-web", name: "Web", risk: "read" },
      { id: "research", name: "Pesquisa", risk: "read" },
      { id: "site-builder", name: "Sites", risk: "write" },
    ]);

    expect(mission.steps.filter((step) => step.title.includes("Pesquisar"))).toHaveLength(1);
    expect(mission.steps.filter((step) => step.skillId === "site-builder")).toHaveLength(1);
  });

  it("keeps approval state visible instead of claiming completion", () => {
    let mission = buildSamuelMission("Envie um email para o cliente", [
      { id: "gmail", name: "Gmail", risk: "write" },
    ]);

    mission = updateSamuelMissionStep(mission, "gmail", {
      status: "waiting_approval",
      evidence: "Rascunho preparado; envio ainda não autorizado.",
    });
    mission = finalizeSamuelMission(mission);

    expect(mission.status).toBe("waiting_approval");
    expect(mission.steps[0]?.status).toBe("waiting_approval");
  });
});
