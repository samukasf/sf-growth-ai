export { InMemoryCommunicationRepository } from "./persistence/in-memory-communication.repository";
export { InMemoryConversationRepository } from "./persistence/in-memory-conversation.repository";
export { InMemoryMessageRepository } from "./persistence/in-memory-message.repository";
export { DefaultCommunicationRouter } from "./services/default-communication-router";
export {
  DefaultConversationAnalyzer,
  DefaultMessageClassifier,
  DefaultSummaryGenerator,
} from "./services/default-analyzers";
export {
  DefaultAutoReplyEngine,
  DefaultApprovalWorkflow,
} from "./services/default-auto-reply-engine";
export { InMemoryEventBus } from "./events/in-memory-event-bus";
export {
  createDefaultChannels,
  createDefaultAutoReplyPolicies,
} from "./constants/default-channels";
export {
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCRMAdapter,
  NoopExecutiveSalesAdapter,
  NoopExecutiveMarketingAdapter,
  NoopExecutiveSupportAdapter,
  NoopCompanyBrainAdapter,
  NoopOrganizationBrainAdapter,
} from "./integration/noop-integration.adapters";
export {
  createBusinessCommunication,
  type CreateBusinessCommunicationOptions,
} from "./factories/create-business-communication";
