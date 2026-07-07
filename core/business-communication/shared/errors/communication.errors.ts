export class CommunicationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommunicationDomainError";
  }
}

export class ConversationNotFoundError extends CommunicationDomainError {
  constructor(conversationId: string) {
    super(`Conversation not found: ${conversationId}`);
    this.name = "ConversationNotFoundError";
  }
}

export class MessageNotFoundError extends CommunicationDomainError {
  constructor(messageId: string) {
    super(`Message not found: ${messageId}`);
    this.name = "MessageNotFoundError";
  }
}

export class CommunicationValidationError extends CommunicationDomainError {
  constructor(message: string) {
    super(message);
    this.name = "CommunicationValidationError";
  }
}
