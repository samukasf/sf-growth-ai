import { AutoReplyPolicy, CommunicationChannel } from "../../domain";
import type { ChannelType } from "../../domain";

const DEFAULT_CHANNELS: Array<{ type: ChannelType; name: string }> = [
  { type: "email", name: "Email" },
  { type: "whatsapp", name: "WhatsApp" },
  { type: "instagram", name: "Instagram" },
  { type: "messenger", name: "Messenger" },
  { type: "telegram", name: "Telegram" },
  { type: "sms", name: "SMS" },
  { type: "rcs", name: "RCS" },
  { type: "internal_chat", name: "Chat Interno" },
  { type: "microsoft_teams", name: "Microsoft Teams" },
  { type: "slack", name: "Slack" },
];

export function createDefaultChannels(organizationId: string): CommunicationChannel[] {
  return DEFAULT_CHANNELS.map((ch) =>
    CommunicationChannel.create({
      organizationId,
      type: ch.type,
      name: ch.name,
      identifier: `${ch.type}@${organizationId}`,
      autonomyLevel: 1,
      status: "pending_setup",
    }),
  );
}

export function createDefaultAutoReplyPolicies(organizationId: string): AutoReplyPolicy[] {
  return [
    AutoReplyPolicy.create({
      organizationId,
      name: "Nível 1 — Sugestão",
      channelTypes: ["email", "whatsapp", "internal_chat"],
      autonomyLevel: 1,
      requiresApproval: true,
      template: "Sugestão de resposta para aprovação humana.",
      active: true,
    }),
    AutoReplyPolicy.create({
      organizationId,
      name: "Nível 2 — Perguntas simples",
      channelTypes: ["whatsapp", "sms"],
      autonomyLevel: 2,
      requiresApproval: false,
      template: "Resposta automática para perguntas simples.",
      active: true,
    }),
    AutoReplyPolicy.create({
      organizationId,
      name: "Nível 3 — Regras",
      channelTypes: ["whatsapp", "email"],
      autonomyLevel: 3,
      requiresApproval: false,
      template: "Execução conforme regras definidas.",
      active: false,
    }),
    AutoReplyPolicy.create({
      organizationId,
      name: "Nível 4 — Autônomo com auditoria",
      channelTypes: ["internal_chat"],
      autonomyLevel: 4,
      requiresApproval: false,
      template: "Comunicação totalmente autônoma com auditoria.",
      active: false,
    }),
  ];
}
