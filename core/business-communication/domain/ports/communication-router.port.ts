import type { ChannelType, CommunicationChannel, Message } from "../entities";

export type RoutingResult = {
  channel: CommunicationChannel;
  targetModule: string;
  priority: number;
};

export interface CommunicationRouter {
  route(message: Message, channelType: ChannelType): RoutingResult;
}
