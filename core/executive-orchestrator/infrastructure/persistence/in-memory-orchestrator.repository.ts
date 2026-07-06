import {
  ExecutiveConsensus,
  ExecutiveContextResolver,
  ExecutiveExecutionPlan,
  ExecutiveRequest,
  ExecutiveSession,
  ExecutiveWorkflow,
  type OrchestratorQuery,
  type OrchestratorRepository,
} from "../../domain";

function serializeRequest(request: ExecutiveRequest): string {
  return JSON.stringify(request.toJSON());
}

function deserializeRequest(raw: string): ExecutiveRequest {
  const parsed = JSON.parse(raw) as ReturnType<ExecutiveRequest["toJSON"]>;
  return ExecutiveRequest.create(parsed);
}

function serializeSession(session: ExecutiveSession): string {
  return JSON.stringify(session.toJSON());
}

function deserializeSession(raw: string): ExecutiveSession {
  const parsed = JSON.parse(raw) as ReturnType<ExecutiveSession["toJSON"]>;
  return ExecutiveSession.create(parsed);
}

export class InMemoryOrchestratorRepository implements OrchestratorRepository {
  private readonly requests = new Map<string, string>();
  private readonly sessions = new Map<string, string>();
  private readonly workflows: ExecutiveWorkflow[] = [];
  private readonly consensusList: ExecutiveConsensus[] = [];
  private readonly contexts: ExecutiveContextResolver[] = [];
  private readonly executionPlans: ExecutiveExecutionPlan[] = [];

  async saveRequest(request: ExecutiveRequest): Promise<void> {
    this.requests.set(request.id, serializeRequest(request));
  }

  async findRequestById(id: string): Promise<ExecutiveRequest | null> {
    const raw = this.requests.get(id);
    return raw ? deserializeRequest(raw) : null;
  }

  async findRequestsByCompany(companyId: string): Promise<ExecutiveRequest[]> {
    const results: ExecutiveRequest[] = [];
    for (const raw of this.requests.values()) {
      const request = deserializeRequest(raw);
      if (request.companyId === companyId) results.push(request);
    }
    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async queryRequests(filters: OrchestratorQuery): Promise<ExecutiveRequest[]> {
    let results = await this.findRequestsByCompany(filters.companyId);
    if (filters.status) {
      results = results.filter((item) => item.status === filters.status);
    }
    if (filters.sessionId) {
      results = results.filter((item) => item.sessionId === filters.sessionId);
    }
    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }
    return results;
  }

  async saveSession(session: ExecutiveSession): Promise<void> {
    this.sessions.set(session.id, serializeSession(session));
  }

  async findSessionById(id: string): Promise<ExecutiveSession | null> {
    const raw = this.sessions.get(id);
    return raw ? deserializeSession(raw) : null;
  }

  async saveWorkflow(workflow: ExecutiveWorkflow): Promise<void> {
    this.workflows.push(workflow);
  }

  async saveConsensus(consensus: ExecutiveConsensus): Promise<void> {
    this.consensusList.push(consensus);
  }

  async saveContextResolver(context: ExecutiveContextResolver): Promise<void> {
    this.contexts.push(context);
  }

  async saveExecutionPlan(plan: ExecutiveExecutionPlan): Promise<void> {
    this.executionPlans.push(plan);
  }
}
