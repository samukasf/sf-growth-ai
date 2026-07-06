import type { CompanyId, ExecutiveRequestId, ExecutiveSessionId } from "../../shared";
import type {
  ExecutiveConsensus,
  ExecutiveContextResolver,
  ExecutiveExecutionPlan,
  ExecutiveRequest,
  ExecutiveSession,
  ExecutiveWorkflow,
} from "../entities";

export type OrchestratorQuery = {
  companyId: CompanyId;
  status?: string;
  sessionId?: ExecutiveSessionId;
  limit?: number;
};

export interface OrchestratorRepository {
  saveRequest(request: ExecutiveRequest): Promise<void>;
  findRequestById(id: ExecutiveRequestId): Promise<ExecutiveRequest | null>;
  findRequestsByCompany(companyId: CompanyId): Promise<ExecutiveRequest[]>;
  queryRequests(filters: OrchestratorQuery): Promise<ExecutiveRequest[]>;
  saveSession(session: ExecutiveSession): Promise<void>;
  findSessionById(id: ExecutiveSessionId): Promise<ExecutiveSession | null>;
  saveWorkflow(workflow: ExecutiveWorkflow): Promise<void>;
  saveConsensus(consensus: ExecutiveConsensus): Promise<void>;
  saveContextResolver(context: ExecutiveContextResolver): Promise<void>;
  saveExecutionPlan(plan: ExecutiveExecutionPlan): Promise<void>;
}
