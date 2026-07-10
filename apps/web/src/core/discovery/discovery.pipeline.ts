import { ContextService } from "../context/context.service";
import type { ContextFragment, ContextSourceProvider } from "../context/context.types";
import { MemoryService } from "../memory/memory.service";
import type { MemoryRepository } from "../memory/memory.repository";
import { createMockMemoryRepository } from "../superbrain/superbrain.mocks";
import {
  buildMemoryRecords,
  mapToCompanyBrainSnapshot,
  mapToDiscoveryResult,
} from "./discovery.mapper";
import { PIPELINE_UI_LABELS } from "./discovery.presenter";
import { collectFromSources, createDefaultDiscoverySources } from "./discovery.sources";
import {
  buildExecutiveSummary,
  buildNextSteps,
  classifyDiscoveryData,
  extractInformation,
} from "./discovery.steps";
import { validateDiscoveryInput } from "./discovery.validator";
import type {
  CompanyBrainWriterPort,
  DiscoveryDependencies,
  DiscoveryInput,
  DiscoveryPipelineStep,
  DiscoveryResult,
} from "./discovery.types";

function step(
  name: DiscoveryPipelineStep["name"],
  status: DiscoveryPipelineStep["status"],
  durationMs: number,
  result?: Record<string, unknown>,
  error?: string,
): DiscoveryPipelineStep {
  return {
    name,
    label: PIPELINE_UI_LABELS[name],
    status,
    durationMs,
    result,
    error,
  };
}

async function runStep<T>(
  name: DiscoveryPipelineStep["name"],
  fn: () => Promise<T>,
  summarize: (value: T) => Record<string, unknown>,
): Promise<{ value: T; pipelineStep: DiscoveryPipelineStep }> {
  const started = performance.now();
  try {
    const value = await fn();
    return {
      value,
      pipelineStep: step(name, "success", Math.round(performance.now() - started), summarize(value)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw Object.assign(new Error(message), {
      pipelineStep: step(name, "failed", Math.round(performance.now() - started), {}, message),
    });
  }
}

function createContextProviderFromBrain(
  snapshot: ReturnType<typeof mapToCompanyBrainSnapshot>,
): ContextSourceProvider {
  const fragment: ContextFragment = {
    id: `discovery-brain-${snapshot.companyId}`,
    source: "COMPANY_BRAIN",
    title: snapshot.companyName,
    content: JSON.stringify(snapshot.profile),
    priority: "HIGH",
    tags: ["discovery", "company-brain"],
    timestamp: snapshot.generatedAt,
  };

  return {
    source: "COMPANY_BRAIN",
    fetch: async () => [fragment],
  };
}

class InMemoryCompanyBrainWriter implements CompanyBrainWriterPort {
  private readonly store = new Map<string, ReturnType<typeof mapToCompanyBrainSnapshot>>();

  async save(snapshot: ReturnType<typeof mapToCompanyBrainSnapshot>): Promise<string> {
    const id = `brain-${snapshot.companyId}-${Date.now()}`;
    this.store.set(id, snapshot);
    return id;
  }

  get(id: string) {
    return this.store.get(id);
  }
}

const defaultBrainWriter = new InMemoryCompanyBrainWriter();

export async function runDiscoveryPipeline(
  input: DiscoveryInput,
  deps: Partial<DiscoveryDependencies> = {},
): Promise<DiscoveryResult> {
  const started = performance.now();
  const pipeline: DiscoveryPipelineStep[] = [];
  const sources = deps.sources ?? createDefaultDiscoverySources();
  const memoryRepository: MemoryRepository =
    deps.memoryRepository ?? createMockMemoryRepository();
  const memoryService = new MemoryService(memoryRepository);
  const brainWriter = deps.companyBrainWriter ?? defaultBrainWriter;

  const validateResult = validateDiscoveryInput(input);
  if (!validateResult.valid || !validateResult.validated) {
    pipeline.push(step("validate", "failed", 0, {}, validateResult.errors.join(" ")));
    throw new Error(validateResult.errors.join(" "));
  }
  pipeline.push(step("validate", "success", 2, { company: validateResult.validated.companyName }));

  const validated = validateResult.validated;

  try {
    const searchStep = await runStep(
      "search_sources",
      () => collectFromSources(validated, sources),
      (raw) => ({ sourceCount: raw.length, sources: raw.map((r) => r.source) }),
    );
    pipeline.push(searchStep.pipelineStep);

    const extractStep = await runStep(
      "extract_information",
      async () => extractInformation(validated, searchStep.value),
      (data) => ({ industry: data.industry, services: data.services.length }),
    );
    pipeline.push(extractStep.pipelineStep);

    const classifyStep = await runStep(
      "classify_data",
      async () => classifyDiscoveryData(validated, extractStep.value),
      (data) => ({ confidence: data.confidence, missing: data.missingInformation.length }),
    );
    pipeline.push(classifyStep.pipelineStep);

    const classified = classifyStep.value;
    const executiveSummary = buildExecutiveSummary(classified);
    const nextSteps = buildNextSteps(classified);

    const brainStep = await runStep(
      "generate_company_brain",
      async () => {
        const snapshot = mapToCompanyBrainSnapshot(validated, classified, "pending");
        const brainId = await brainWriter.save(snapshot);
        return { brainId, snapshot: { ...snapshot, profile: { ...snapshot.profile, id: brainId } } };
      },
      (data) => ({ brainId: data.brainId, growthScore: data.snapshot.growthScore }),
    );
    pipeline.push(brainStep.pipelineStep);

    const memoryStep = await runStep(
      "save_memory",
      async () => {
        const records = buildMemoryRecords(validated, classified, executiveSummary);
        const created = await Promise.all(records.map((record) => memoryService.create(record)));
        return created.length;
      },
      (count) => ({ memoriesCreated: count }),
    );
    pipeline.push(memoryStep.pipelineStep);

    const contextStep = await runStep(
      "update_context",
      async () => {
        const provider = createContextProviderFromBrain(brainStep.value.snapshot);
        const contextService = new ContextService([provider, ...(deps.contextProviders ?? [])]);
        const output = await contextService.buildOutput({
          tenantId: validated.tenantId,
          companyId: validated.companyId,
          query: `Discovery ${validated.companyName}`,
        });
        return output.prioritizedFragments.length;
      },
      (count) => ({ contextFragments: count }),
    );
    pipeline.push(contextStep.pipelineStep);

    pipeline.push(
      step("complete", "success", 1, {
        status: "finished",
        confidence: classified.confidence,
      }),
    );

    return mapToDiscoveryResult({
      input: validated,
      data: classified,
      brainId: brainStep.value.brainId,
      executiveSummary,
      nextSteps,
      pipeline,
      memoriesCreated: memoryStep.value,
      contextFragmentCount: contextStep.value,
      totalDurationMs: Math.round(performance.now() - started),
    });
  } catch (error) {
    const failedStep = (error as { pipelineStep?: DiscoveryPipelineStep }).pipelineStep;
    if (failedStep) pipeline.push(failedStep);
    throw error;
  }
}

export function getDefaultBrainWriter(): InMemoryCompanyBrainWriter {
  return defaultBrainWriter;
}
