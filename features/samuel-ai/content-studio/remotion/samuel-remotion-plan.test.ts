import { describe, expect, it } from "vitest";

import type { SamuelContentProject } from "../samuel-content.types";
import { buildSamuelRemotionPlan } from "./samuel-remotion-plan";

const project: SamuelContentProject = {
  id: "test",
  format: "video",
  name: "Test",
  objective: "Test",
  audience: "Test",
  hook: "Test",
  script: "Test",
  callToAction: "Test",
  aspectRatio: "9:16",
  scenes: [
    {
      headline: "A",
      supportingText: "A",
      visualDirection: "A",
      durationSeconds: 4,
    },
    {
      headline: "B",
      supportingText: "B",
      visualDirection: "B",
      durationSeconds: 6,
    },
  ],
  socialCopies: [],
  platforms: ["instagram"],
  provider: "test",
  model: null,
  createdAt: "2026-09-30T00:00:00.000Z",
};

describe("buildSamuelRemotionPlan", () => {
  it("creates a deterministic portrait timeline", () => {
    const plan = buildSamuelRemotionPlan(project, "1080p", 30);

    expect(plan.width).toBe(1080);
    expect(plan.height).toBe(1920);
    expect(plan.durationInFrames).toBe(300);
    expect(plan.scenes).toEqual([
      { index: 0, from: 0, durationInFrames: 120 },
      { index: 1, from: 120, durationInFrames: 180 },
    ]);
  });

  it("stretches scene timing when narration is longer than the scene plan", () => {
    const plan = buildSamuelRemotionPlan(project, "720p", 30, 20);

    expect(plan.durationInFrames).toBe(600);
    expect(plan.scenes[0]).toEqual({ index: 0, from: 0, durationInFrames: 240 });
    expect(plan.scenes[1]).toEqual({ index: 1, from: 240, durationInFrames: 360 });
  });

  it("keeps the project scene duration when narration is shorter", () => {
    const plan = buildSamuelRemotionPlan(project, "1080p", 24, 3);

    expect(plan.durationSeconds).toBe(10);
    expect(plan.durationInFrames).toBe(240);
  });
});
