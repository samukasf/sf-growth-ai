import {
  createDiscoveryStartedEvent,
  DiscoveryQuestionnaire,
  DiscoverySession,
} from "../../domain";
import type { DiscoverySourceType } from "../../shared";
import type { StartDiscoveryDto } from "../dto";
import type { CompanyDiscoveryDependencies } from "../dependencies";

const DEFAULT_SOURCE_TYPES: DiscoverySourceType[] = [
  "website",
  "google_business",
  "facebook",
  "instagram",
  "linkedin",
  "crm",
  "erp",
  "documents",
  "employees",
  "questionnaires",
  "interviews",
  "uploaded_files",
];

const DEFAULT_QUESTIONS = [
  { id: "q-mission", area: "identity", question: "Qual é a missão da empresa?", required: true },
  { id: "q-products", area: "products", question: "Quais são os principais produtos ou serviços?", required: true },
  { id: "q-customers", area: "customers", question: "Quem são os clientes principais?", required: true },
  { id: "q-challenges", area: "operations", question: "Quais são os maiores desafios operacionais?", required: true },
  { id: "q-goals", area: "strategy", question: "Quais são os objetivos para os próximos 12 meses?", required: true },
];

export class StartDiscoverySessionUseCase {
  constructor(private readonly deps: CompanyDiscoveryDependencies) {}

  async execute(dto: StartDiscoveryDto) {
    const sourceTypes = dto.sourceTypes ?? DEFAULT_SOURCE_TYPES;

    const session = DiscoverySession.create({
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      companyName: dto.companyName,
      sourceTypes,
      initiatedBy: dto.initiatedBy,
      status: "collecting",
    });

    await this.deps.repository.saveSession(session);
    await this.deps.eventDispatcher.publish(createDiscoveryStartedEvent(session));

    await this.deps.organizationBrain.registerOrganization(
      dto.organizationId,
      dto.companyId,
    );

    const questionnaire = DiscoveryQuestionnaire.create({
      sessionId: session.id,
      title: "Questionário de Descoberta Empresarial",
      questions: DEFAULT_QUESTIONS,
    });
    await this.deps.repository.saveQuestionnaire(questionnaire);

    return { session };
  }
}
