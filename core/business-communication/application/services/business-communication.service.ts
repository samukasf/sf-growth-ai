import type {
  ApproveAutoReplyDto,
  CloseConversationDto,
  ReceiveMessageDto,
  SendMessageDto,
} from "../dto";
import type { BusinessCommunicationDependencies } from "../dependencies";
import {
  ApproveAutoReplyUseCase,
  CloseConversationUseCase,
  ReceiveMessageUseCase,
  SendMessageUseCase,
} from "../use-cases";

export class BusinessCommunicationService {
  private readonly receiveUseCase: ReceiveMessageUseCase;
  private readonly sendUseCase: SendMessageUseCase;
  private readonly approveUseCase: ApproveAutoReplyUseCase;
  private readonly closeUseCase: CloseConversationUseCase;

  constructor(private readonly deps: BusinessCommunicationDependencies) {
    this.receiveUseCase = new ReceiveMessageUseCase(deps);
    this.sendUseCase = new SendMessageUseCase(deps);
    this.approveUseCase = new ApproveAutoReplyUseCase(deps);
    this.closeUseCase = new CloseConversationUseCase(deps);
  }

  receiveMessage(dto: ReceiveMessageDto) {
    return this.receiveUseCase.execute(dto);
  }

  sendMessage(dto: SendMessageDto) {
    return this.sendUseCase.execute(dto);
  }

  approveAutoReply(dto: ApproveAutoReplyDto) {
    return this.approveUseCase.execute(dto);
  }

  closeConversation(dto: CloseConversationDto) {
    return this.closeUseCase.execute(dto);
  }

  async listChannels(organizationId: string) {
    return this.deps.communicationRepository.findChannelsByOrganization(organizationId);
  }

  async listConversations(organizationId: string) {
    return this.deps.conversationRepository.findByOrganization(organizationId);
  }
}
