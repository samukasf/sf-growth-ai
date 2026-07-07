import type { EventDispatcher } from "../shared";
import type {
  ApprovalWorkflow,
  AutoReplyEngine,
  CommunicationRepository,
  CommunicationRouter,
  ConversationAnalyzer,
  ConversationRepository,
  MessageClassifier,
  MessageRepository,
  SummaryGenerator,
} from "../domain";
import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveCRMPort,
  ExecutiveMarketingPort,
  ExecutiveOrchestratorPort,
  ExecutiveSalesPort,
  ExecutiveSupportPort,
  OrganizationBrainPort,
} from "./ports/integration";

export type BusinessCommunicationDependencies = {
  communicationRepository: CommunicationRepository;
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
  router: CommunicationRouter;
  conversationAnalyzer: ConversationAnalyzer;
  messageClassifier: MessageClassifier;
  summaryGenerator: SummaryGenerator;
  autoReplyEngine: AutoReplyEngine;
  approvalWorkflow: ApprovalWorkflow;
  eventDispatcher: EventDispatcher;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCrm: ExecutiveCRMPort;
  executiveSales: ExecutiveSalesPort;
  executiveMarketing: ExecutiveMarketingPort;
  executiveSupport: ExecutiveSupportPort;
  companyBrain: CompanyBrainPort;
  organizationBrain: OrganizationBrainPort;
};
