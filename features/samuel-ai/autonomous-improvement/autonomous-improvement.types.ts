export type ImprovementAgentDomain =
  | "architecture"
  | "code"
  | "quality"
  | "security"
  | "performance"
  | "product"
  | "growth"
  | "integrations"
  | "data"
  | "operations";

export type ImprovementRiskLevel = "low" | "medium" | "high";

export type ImprovementAgent = {
  id: string;
  name: string;
  domain: ImprovementAgentDomain;
  mission: string;
  cadence: "hourly" | "daily" | "weekly" | "on_signal";
  output: "metric" | "recommendation" | "patch_plan" | "test_plan" | "incident_plan";
  riskLevel: ImprovementRiskLevel;
};

export type ImprovementSignalSeverity = "healthy" | "notice" | "warning" | "critical";

export type ImprovementSignal = {
  id: string;
  title: string;
  detail: string;
  severity: ImprovementSignalSeverity;
  source: string;
  agentIds: string[];
  evidence: string[];
};

export type ImprovementBacklogItem = {
  id: string;
  title: string;
  outcome: string;
  ownerAgentIds: string[];
  priority: "low" | "medium" | "high" | "critical";
  effort: "small" | "medium" | "large";
  canRunAutomatically: boolean;
  requiresHumanApproval: boolean;
};

export type AutonomousImprovementReport = {
  id: string;
  generatedAt: string;
  mode: "status" | "manual" | "cron";
  sourceRepository: {
    name: string;
    url: string;
    configured: boolean;
    integrationMode: "bridge" | "catalog_only";
  };
  agentCatalog: {
    totalAgents: number;
    activeAgents: number;
    domains: Record<ImprovementAgentDomain, number>;
    highlightedAgents: ImprovementAgent[];
  };
  loop: {
    enabled: boolean;
    cadence: string;
    runner: "vercel_cron" | "manual" | "external_worker";
    writeMode: "read_only" | "proposal_only" | "pull_request";
    safety: string[];
  };
  intelligence: {
    providerConfigured: boolean;
    realtimeConfigured: boolean;
    memoryConfigured: boolean;
    rufloBridgeConfigured: boolean;
    expectedResponseMode: "local_fallback" | "gateway" | "openai" | "kimi";
  };
  performance: {
    estimatedLatencyPolicy: "fast_default" | "balanced" | "configuration_required";
    parallelizationPotential: number;
    cacheReadiness: number;
    bottlenecks: string[];
  };
  signals: ImprovementSignal[];
  backlog: ImprovementBacklogItem[];
  nextBestAction: string;
};
