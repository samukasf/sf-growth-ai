import { OrchestratorService } from "../orchestrator/orchestrator.service";
import { generateMockDecision } from "./decision-engine.mock";
import {
  DEMO_COMPANY_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  createMockCompanyBrainPort,
  createMockContextProviders,
  createMockExecutiveCouncilPort,
  createMockMemoryRepository,
} from "./superbrain.mocks";
import { buildRuntimeResponse } from "./superbrain.runtime-response";
import type { RuntimeResponse, SuperbrainPipelineStep, SuperbrainRunInput } from "./superbrain.types";

export class SuperbrainRuntime {
  private readonly orchestrator: OrchestratorService;

  constructor() {
    this.orchestrator = new OrchestratorService({
      memoryRepository: createMockMemoryRepository(),
      contextProviders: createMockContextProviders(),
      companyBrain: createMockCompanyBrainPort(),
      executiveCouncil: createMockExecutiveCouncilPort(),
      llmProvider: null,
    });
  }

  async run(input: SuperbrainRunInput): Promise<RuntimeResponse> {
    const started = performance.now();
    const tenantId = input.tenantId ?? DEMO_TENANT_ID;
    const companyId = input.companyId ?? DEMO_COMPANY_ID;
    const userId = input.userId ?? DEMO_USER_ID;

    const orchestratorResponse = await this.orchestrator.processMessage({
      tenantId,
      companyId,
      userId,
      content: input.query,
    });

    const decisionStarted = performance.now();
    const decision = generateMockDecision(orchestratorResponse);
    const decisionDurationMs = Math.round(performance.now() - decisionStarted);

    const decisionStep: SuperbrainPipelineStep = {
      name: "load_decision",
      status: "success",
      durationMs: decisionDurationMs,
      result: {
        decisionId: decision.id,
        priority: decision.priority,
        title: decision.title,
      },
    };

    const totalDurationMs = Math.round(performance.now() - started);

    return buildRuntimeResponse(
      orchestratorResponse,
      decision,
      decisionStep,
      totalDurationMs,
    );
  }
}

let defaultRuntime: SuperbrainRuntime | null = null;

export function getSuperbrainRuntime(): SuperbrainRuntime {
  if (!defaultRuntime) {
    defaultRuntime = new SuperbrainRuntime();
  }
  return defaultRuntime;
}

export async function runSuperbrain(input: SuperbrainRunInput): Promise<RuntimeResponse> {
  return getSuperbrainRuntime().run(input);
}
