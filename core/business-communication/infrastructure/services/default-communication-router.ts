import { CommunicationChannel, type ChannelType, type CommunicationRouter, type Message } from "../../domain";
import type { CommunicationRepository } from "../../domain";

const MODULE_BY_CHANNEL: Record<ChannelType, string> = {
  email: "executive_support",
  whatsapp: "executive_sales",
  instagram: "executive_marketing",
  messenger: "executive_marketing",
  telegram: "executive_support",
  sms: "executive_sales",
  rcs: "executive_sales",
  internal_chat: "executive_support",
  microsoft_teams: "executive_support",
  slack: "executive_support",
};

export class DefaultCommunicationRouter implements CommunicationRouter {
  constructor(private readonly repository: CommunicationRepository) {}

  route(message: Message, channelType: ChannelType) {
    const fallbackChannel = CommunicationChannel.create({
      organizationId: message.organizationId,
      type: channelType,
      name: channelType,
      identifier: channelType,
      autonomyLevel: 1,
    });

    return {
      channel: fallbackChannel,
      targetModule: MODULE_BY_CHANNEL[channelType] ?? "executive_support",
      priority: channelType === "whatsapp" || channelType === "sms" ? 90 : 50,
    };
  }
}
