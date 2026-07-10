import type { DiscoveryPipelineStep, DiscoveryPipelineStepName, DiscoveryResult } from "./discovery.types";

export const PIPELINE_UI_LABELS: Record<DiscoveryPipelineStepName, string> = {
  validate: "Validando",
  search_sources: "Coletando dados",
  extract_information: "Coletando dados",
  classify_data: "Coletando dados",
  generate_company_brain: "Construindo Company Brain",
  save_memory: "Atualizando Memory",
  update_context: "Atualizando Context",
  complete: "Finalizado",
};

export const PIPELINE_DISPLAY_ORDER: DiscoveryPipelineStepName[] = [
  "validate",
  "search_sources",
  "generate_company_brain",
  "save_memory",
  "update_context",
  "complete",
];

export function formatConfidence(value: number): string {
  return `${value}%`;
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export interface DiscoveryViewModel {
  headline: string;
  confidenceLabel: string;
  durationLabel: string;
  displaySteps: Array<{
    key: string;
    label: string;
    status: DiscoveryPipelineStep["status"];
    durationMs: number;
    done: boolean;
  }>;
}

function aggregateStepStatus(
  pipeline: DiscoveryPipelineStep[],
  names: DiscoveryPipelineStepName[],
): DiscoveryPipelineStep["status"] {
  const steps = pipeline.filter((s) => names.includes(s.name));
  if (steps.some((s) => s.status === "failed")) return "failed";
  if (steps.every((s) => s.status === "success" || s.status === "skipped")) return "success";
  if (steps.some((s) => s.status === "running")) return "running";
  return "pending";
}

function aggregateDuration(pipeline: DiscoveryPipelineStep[], names: DiscoveryPipelineStepName[]): number {
  return pipeline
    .filter((s) => names.includes(s.name))
    .reduce((sum, s) => sum + s.durationMs, 0);
}

export function presentDiscovery(result: DiscoveryResult): DiscoveryViewModel {
  const collectNames: DiscoveryPipelineStepName[] = [
    "search_sources",
    "extract_information",
    "classify_data",
  ];

  const displaySteps = PIPELINE_DISPLAY_ORDER.map((key) => {
    const names =
      key === "search_sources"
        ? collectNames
        : ([key] as DiscoveryPipelineStepName[]);

    const status = aggregateStepStatus(result.pipeline, names);
    const durationMs = aggregateDuration(result.pipeline, names);

    return {
      key,
      label: PIPELINE_UI_LABELS[key],
      status,
      durationMs,
      done: status === "success",
    };
  });

  return {
    headline: `Discovery — ${result.company}`,
    confidenceLabel: formatConfidence(result.confidence),
    durationLabel: formatDuration(result.totalDurationMs),
    displaySteps,
  };
}
