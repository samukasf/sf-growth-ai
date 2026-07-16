import type {
  ImprovementAgent,
  ImprovementAgentDomain,
  ImprovementRiskLevel,
} from "./autonomous-improvement.types";

type AgentGroup = {
  domain: ImprovementAgentDomain;
  cadence: ImprovementAgent["cadence"];
  output: ImprovementAgent["output"];
  riskLevel: ImprovementRiskLevel;
  roles: string[];
};

const AGENT_GROUPS: AgentGroup[] = [
  {
    domain: "architecture",
    cadence: "daily",
    output: "patch_plan",
    riskLevel: "medium",
    roles: [
      "Principal Architect",
      "Next Runtime Architect",
      "API Boundary Architect",
      "Domain Modeling Architect",
      "Design System Architect",
      "Mobile PWA Architect",
      "Scalability Architect",
    ],
  },
  {
    domain: "code",
    cadence: "on_signal",
    output: "patch_plan",
    riskLevel: "medium",
    roles: [
      "Frontend Builder",
      "Backend Builder",
      "Studio Builder",
      "Integration Builder",
      "Refactor Specialist",
      "TypeScript Strictness Agent",
      "Dependency Hygiene Agent",
    ],
  },
  {
    domain: "quality",
    cadence: "on_signal",
    output: "test_plan",
    riskLevel: "low",
    roles: [
      "Unit Test Agent",
      "Regression Test Agent",
      "Accessibility QA",
      "Visual QA",
      "Mobile QA",
      "Conversation QA",
      "Voice QA",
    ],
  },
  {
    domain: "security",
    cadence: "daily",
    output: "incident_plan",
    riskLevel: "high",
    roles: [
      "OAuth Security Auditor",
      "Prompt Injection Auditor",
      "Secret Leakage Auditor",
      "Webhook Guard Agent",
      "Sandbox Policy Agent",
      "Supply Chain Auditor",
      "Data Privacy Auditor",
    ],
  },
  {
    domain: "performance",
    cadence: "hourly",
    output: "metric",
    riskLevel: "low",
    roles: [
      "Latency Profiler",
      "Bundle Size Agent",
      "Cache Strategy Agent",
      "Streaming Optimizer",
      "Realtime Voice Optimizer",
      "Image Asset Optimizer",
      "Database Query Optimizer",
    ],
  },
  {
    domain: "product",
    cadence: "daily",
    output: "recommendation",
    riskLevel: "low",
    roles: [
      "Executive UX Strategist",
      "Onboarding Agent",
      "Samuel Personality Agent",
      "Hologram Experience Agent",
      "Site Builder PM",
      "App Builder PM",
      "Retention Agent",
    ],
  },
  {
    domain: "growth",
    cadence: "daily",
    output: "recommendation",
    riskLevel: "low",
    roles: [
      "SEO Growth Agent",
      "Paid Media Agent",
      "Meta Campaign Agent",
      "TikTok Growth Agent",
      "Google Business Agent",
      "Lead Response Agent",
      "CRM Pipeline Agent",
    ],
  },
  {
    domain: "integrations",
    cadence: "on_signal",
    output: "patch_plan",
    riskLevel: "high",
    roles: [
      "Gmail Integration Agent",
      "Google Calendar Agent",
      "Google Drive Agent",
      "WhatsApp Business Agent",
      "Meta OAuth Agent",
      "TikTok OAuth Agent",
      "Maps and Location Agent",
    ],
  },
  {
    domain: "data",
    cadence: "daily",
    output: "metric",
    riskLevel: "medium",
    roles: [
      "Memory Curation Agent",
      "Company Brain Agent",
      "Event Deduplication Agent",
      "Signal Ranking Agent",
      "Analytics Normalization Agent",
      "Learning Loop Agent",
      "Forecast Agent",
    ],
  },
  {
    domain: "operations",
    cadence: "hourly",
    output: "incident_plan",
    riskLevel: "medium",
    roles: [
      "Deploy Monitor",
      "Vercel Health Agent",
      "GitHub PR Agent",
      "Incident Commander",
      "Backlog Prioritizer",
      "Cost Control Agent",
      "Release Notes Agent",
    ],
  },
];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function missionFor(domain: ImprovementAgentDomain, role: string) {
  const domainLabel = domain.replaceAll("_", " ");
  return `${role} monitors ${domainLabel} signals, finds measurable improvements and produces safe, reviewable actions for Samuel AI.`;
}

export const SAMUEL_AUTONOMOUS_AGENTS: ImprovementAgent[] = AGENT_GROUPS.flatMap((group) =>
  group.roles.map((role, index) => ({
    id: `${group.domain}-${slug(role)}-${index + 1}`,
    name: role,
    domain: group.domain,
    mission: missionFor(group.domain, role),
    cadence: group.cadence,
    output: group.output,
    riskLevel: group.riskLevel,
  })),
);

export const DEFAULT_RUFLO_REPOSITORY_URL = "https://github.com/ruvnet/ruflo";

export function countAgentsByDomain(agents: ImprovementAgent[] = SAMUEL_AUTONOMOUS_AGENTS) {
  return agents.reduce(
    (totals, agent) => {
      totals[agent.domain] += 1;
      return totals;
    },
    {
      architecture: 0,
      code: 0,
      quality: 0,
      security: 0,
      performance: 0,
      product: 0,
      growth: 0,
      integrations: 0,
      data: 0,
      operations: 0,
    } satisfies Record<ImprovementAgentDomain, number>,
  );
}

