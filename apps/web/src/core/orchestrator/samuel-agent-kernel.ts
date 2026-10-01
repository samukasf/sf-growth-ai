import {
  formatSamuelSkillContext,
  selectSamuelSkills,
  type SamuelSelectedSkill,
} from "./samuel-skills.registry";

export const SAMUEL_CONVERSATION_CHANNELS = [
  "web",
  "voice",
  "whatsapp",
  "telegram",
  "desktop",
  "api",
] as const;

export type SamuelConversationChannel =
  (typeof SAMUEL_CONVERSATION_CHANNELS)[number];

export type SamuelAgentTurnPlan = {
  channel: SamuelConversationChannel;
  skills: SamuelSelectedSkill[];
  surfaces: string[];
  highestRisk: "read" | "write" | "sensitive";
  context: string;
};

const RISK_WEIGHT = { read: 0, write: 1, sensitive: 2 } as const;

export function isSamuelConversationChannel(
  value: unknown,
): value is SamuelConversationChannel {
  return (
    typeof value === "string" &&
    (SAMUEL_CONVERSATION_CHANNELS as readonly string[]).includes(value)
  );
}

export function planSamuelAgentTurn(
  query: string,
  channel: SamuelConversationChannel = "web",
): SamuelAgentTurnPlan {
  const skills = selectSamuelSkills(query);
  const surfaces = [...new Set(skills.flatMap((skill) => skill.surfaces))];
  const highestRisk = skills.reduce<"read" | "write" | "sensitive">(
    (current, skill) =>
      RISK_WEIGHT[skill.risk] > RISK_WEIGHT[current] ? skill.risk : current,
    "read",
  );
  const skillContext = formatSamuelSkillContext(skills);

  return {
    channel,
    skills,
    surfaces,
    highestRisk,
    context: [
      `[SAMUEL TURN — CANAL] ${channel}`,
      "Todos os canais pertencem ao mesmo Samuel. Preserve continuidade e não crie uma persona ou memória separada por canal.",
      skillContext,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
