import { describe, expect, it } from "vitest";

import {
  isSamuelConversationChannel,
  planSamuelAgentTurn,
} from "./samuel-agent-kernel";

describe("Samuel agent kernel", () => {
  it("keeps channel identity while selecting skills", () => {
    const plan = planSamuelAgentTurn(
      "Veja meu email e agende uma reunião",
      "voice",
    );

    expect(plan.channel).toBe("voice");
    expect(plan.skills.map((skill) => skill.id)).toContain("gmail");
    expect(plan.skills.map((skill) => skill.id)).toContain("calendar");
    expect(plan.highestRisk).toBe("write");
  });

  it("accepts only supported channels", () => {
    expect(isSamuelConversationChannel("whatsapp")).toBe(true);
    expect(isSamuelConversationChannel("random-channel")).toBe(false);
  });
});
