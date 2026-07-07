import { ConversationNotFoundError } from "../../shared";
import {
  CommunicationSession,
  Conversation,
  Message,
  Participant,
  createAutoReplyApprovedEvent,
  createAutoReplyExecutedEvent,
  createAutoReplySuggestedEvent,
  createConversationClosedEvent,
  createConversationStartedEvent,
  createMessageReceivedEvent,
  createMessageSentEvent,
} from "../../domain";
import type {
  ApproveAutoReplyDto,
  CloseConversationDto,
  ReceiveMessageDto,
  SendMessageDto,
} from "../dto";
import type { BusinessCommunicationDependencies } from "../dependencies";

export class ReceiveMessageUseCase {
  constructor(private readonly deps: BusinessCommunicationDependencies) {}

  async execute(dto: ReceiveMessageDto) {
    const channel = await this.deps.communicationRepository.findChannelById(dto.channelId);
    if (!channel) throw new Error(`Channel not found: ${dto.channelId}`);

    let conversation: Conversation;
    if (dto.conversationId) {
      const existing = await this.deps.conversationRepository.findById(dto.conversationId);
      if (!existing) throw new ConversationNotFoundError(dto.conversationId);
      conversation = existing;
    } else {
      const sender = Participant.create({
        organizationId: dto.organizationId,
        name: dto.senderName,
        role: "customer",
        channelIdentifier: dto.senderIdentifier,
      });
      await this.deps.communicationRepository.saveParticipant(sender);

      conversation = Conversation.create({
        organizationId: dto.organizationId,
        channelId: dto.channelId,
        subject: dto.subject ?? `Conversa via ${dto.channelType}`,
        participantIds: [sender.id],
      });
      await this.deps.conversationRepository.save(conversation);
      await this.deps.eventDispatcher.publish(createConversationStartedEvent(conversation));

      await this.deps.communicationRepository.saveSession(
        CommunicationSession.create({
          organizationId: dto.organizationId,
          conversationId: conversation.id,
        }),
      );
    }

    const sender = await this.deps.communicationRepository.findParticipantById(
      conversation.participantIds[0]!,
    );

    const classification = this.deps.messageClassifier.classify(
      Message.create({
        organizationId: dto.organizationId,
        conversationId: conversation.id,
        senderId: sender?.id ?? "unknown",
        direction: "inbound",
        content: dto.content,
        attachmentIds: [],
      }),
    );

    const message = Message.create({
      organizationId: dto.organizationId,
      conversationId: conversation.id,
      senderId: sender?.id ?? "unknown",
      direction: "inbound",
      content: dto.content,
      attachmentIds: [],
      classification: classification.category,
    });

    await this.deps.messageRepository.save(message);
    const updatedConversation = conversation.withMessage();
    await this.deps.conversationRepository.save(updatedConversation);
    await this.deps.eventDispatcher.publish(createMessageReceivedEvent(message));

    this.deps.router.route(message, dto.channelType);

    const policies = await this.deps.communicationRepository.findPoliciesByOrganization(
      dto.organizationId,
    );
    const suggestion = this.deps.autoReplyEngine.suggest(message, policies);

    if (suggestion) {
      await this.deps.eventDispatcher.publish(
        createAutoReplySuggestedEvent({
          organizationId: dto.organizationId,
          conversationId: conversation.id,
          messageId: message.id,
          suggestedReply: suggestion.suggestedReply,
          autonomyLevel: suggestion.autonomyLevel,
          requiresApproval: suggestion.requiresApproval,
        }),
      );

      if (
        !suggestion.requiresApproval &&
        this.deps.autoReplyEngine.canAutoExecute(
          suggestion.autonomyLevel,
          classification.category,
        )
      ) {
        const reply = Message.create({
          organizationId: dto.organizationId,
          conversationId: conversation.id,
          senderId: "bot",
          direction: "outbound",
          content: suggestion.suggestedReply,
          attachmentIds: [],
        });
        await this.deps.messageRepository.save(reply);
        await this.deps.eventDispatcher.publish(
          createAutoReplyExecutedEvent({
            message: reply,
            autonomyLevel: suggestion.autonomyLevel,
          }),
        );
      }
    }

    const messages = await this.deps.messageRepository.findByConversation(conversation.id);
    const analysis = this.deps.conversationAnalyzer.analyze(updatedConversation, messages);
    const summary = this.deps.summaryGenerator.generate(updatedConversation, messages);
    await this.deps.conversationRepository.saveSummary(summary);

    return { conversation: updatedConversation, message, classification, analysis, summary, suggestion };
  }
}

export class SendMessageUseCase {
  constructor(private readonly deps: BusinessCommunicationDependencies) {}

  async execute(dto: SendMessageDto) {
    const conversation = await this.deps.conversationRepository.findById(dto.conversationId);
    if (!conversation) throw new ConversationNotFoundError(dto.conversationId);

    const message = Message.create({
      organizationId: dto.organizationId,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      direction: "outbound",
      content: dto.content,
      attachmentIds: [],
    });

    await this.deps.messageRepository.save(message);
    await this.deps.conversationRepository.save(conversation.withMessage());
    await this.deps.eventDispatcher.publish(createMessageSentEvent(message));

    return message;
  }
}

export class ApproveAutoReplyUseCase {
  constructor(private readonly deps: BusinessCommunicationDependencies) {}

  async execute(dto: ApproveAutoReplyDto) {
    await this.deps.eventDispatcher.publish(
      createAutoReplyApprovedEvent({
        organizationId: dto.organizationId,
        conversationId: dto.conversationId,
        messageId: dto.messageId,
        approvedReply: dto.approvedReply,
        approverId: dto.approverId,
      }),
    );

    const reply = Message.create({
      organizationId: dto.organizationId,
      conversationId: dto.conversationId,
      senderId: dto.approverId,
      direction: "outbound",
      content: dto.approvedReply,
      attachmentIds: [],
    });

    await this.deps.messageRepository.save(reply);
    await this.deps.eventDispatcher.publish(
      createAutoReplyExecutedEvent({ message: reply, autonomyLevel: 1 }),
    );
    await this.deps.eventDispatcher.publish(createMessageSentEvent(reply));

    return reply;
  }
}

export class CloseConversationUseCase {
  constructor(private readonly deps: BusinessCommunicationDependencies) {}

  async execute(dto: CloseConversationDto) {
    const conversation = await this.deps.conversationRepository.findById(dto.conversationId);
    if (!conversation) throw new ConversationNotFoundError(dto.conversationId);

    const closed = conversation.close();
    await this.deps.conversationRepository.save(closed);
    await this.deps.eventDispatcher.publish(createConversationClosedEvent(closed));

    return closed;
  }
}
