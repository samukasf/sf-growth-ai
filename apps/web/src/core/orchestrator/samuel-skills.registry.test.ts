import { describe, expect, it } from "vitest";

import {
  formatSamuelSkillContext,
  selectSamuelSkills,
} from "./samuel-skills.registry";

describe("Samuel skills registry", () => {
  it("always keeps conversation as the base skill", () => {
    expect(selectSamuelSkills("olá").map((skill) => skill.id)).toContain("conversation");
  });

  it("selects calendar and email skills from one natural-language request", () => {
    const selected = selectSamuelSkills(
      "Veja meu Gmail e depois agende uma reunião amanhã",
    ).map((skill) => skill.id);

    expect(selected).toContain("gmail");
    expect(selected).toContain("calendar");
  });

  it("selects live web for current weather questions", () => {
    const selected = selectSamuelSkills(
      "Qual a previsão do tempo hoje em Lisboa?",
    ).map((skill) => skill.id);

    expect(selected).toContain("live-web");
  });

  it("marks execution claims as evidence-bound in the LLM context", () => {
    const context = formatSamuelSkillContext(
      selectSamuelSkills("Abra uma pasta no meu computador"),
    );

    expect(context).toContain("Samuel Desktop");
    expect(context).toContain("Só afirme que uma ação ocorreu");
  });
});
