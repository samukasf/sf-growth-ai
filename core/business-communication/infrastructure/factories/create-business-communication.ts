import type { BusinessCommunicationDependencies } from "../../application";
import { BusinessCommunicationService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopCompanyBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCRMAdapter,
  NoopExecutiveMarketingAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveSalesAdapter,
  NoopExecutiveSupportAdapter,
  NoopOrganizationBrainAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryCommunicationRepository } from "../persistence/in-memory-communication.repository";
import { InMemoryConversationRepository } from "../persistence/in-memory-conversation.repository";
import { InMemoryMessageRepository } from "../persistence/in-memory-message.repository";
import {
  DefaultConversationAnalyzer,
  DefaultMessageClassifier,
  DefaultSummaryGenerator,
} from "../services/default-analyzers";
import {
  DefaultApprovalWorkflow,
  DefaultAutoReplyEngine,
} from "../services/default-auto-reply-engine";
import { DefaultCommunicationRouter } from "../services/default-communication-router";
import {
  createDefaultAutoReplyPolicies,
  createDefaultChannels,
} from "../constants/default-channels";

export type CreateBusinessCommunicationOptions = {
  organizationId?: string;
  dependencies?: Partial<BusinessCommunicationDependencies>;
};

export async function createBusinessCommunication(
  options: CreateBusinessCommunicationOptions = {},
): Promise<BusinessCommunicationService> {
  const organizationId = options.organizationId ?? "default-org";
  const communicationRepository =
    options.dependencies?.communicationRepository ?? new InMemoryCommunicationRepository();

  if ((await communicationRepository.findChannelsByOrganization(organizationId)).length === 0) {
    for (const channel of createDefaultChannels(organizationId)) {
      await communicationRepository.saveChannel(channel);
    }
    for (const policy of createDefaultAutoReplyPolicies(organizationId)) {
      await communicationRepository.savePolicy(policy);
    }
  }

  const dependencies: BusinessCommunicationDependencies = {
    communicationRepository,
    conversationRepository:
      options.dependencies?.conversationRepository ?? new InMemoryConversationRepository(),
    messageRepository:
      options.dependencies?.messageRepository ?? new InMemoryMessageRepository(),
    router:
      options.dependencies?.router ?? new DefaultCommunicationRouter(communicationRepository),
    conversationAnalyzer:
      options.dependencies?.conversationAnalyzer ?? new DefaultConversationAnalyzer(),
    messageClassifier:
      options.dependencies?.messageClassifier ?? new DefaultMessageClassifier(),
    summaryGenerator:
      options.dependencies?.summaryGenerator ?? new DefaultSummaryGenerator(),
    autoReplyEngine: options.dependencies?.autoReplyEngine ?? new DefaultAutoReplyEngine(),
    approvalWorkflow:
      options.dependencies?.approvalWorkflow ?? new DefaultApprovalWorkflow(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCRMAdapter(),
    executiveSales: options.dependencies?.executiveSales ?? new NoopExecutiveSalesAdapter(),
    executiveMarketing:
      options.dependencies?.executiveMarketing ?? new NoopExecutiveMarketingAdapter(),
    executiveSupport:
      options.dependencies?.executiveSupport ?? new NoopExecutiveSupportAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
  };

  return new BusinessCommunicationService(dependencies);
}
