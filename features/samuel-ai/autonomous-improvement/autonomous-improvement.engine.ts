import {
  countAgentsByDomain,
  DEFAULT_RUFLO_REPOSITORY_URL,
  SAMUEL_AUTONOMOUS_AGENTS,
} from "./autonomous-agent-catalog";
import type {
  AutonomousImprovementReport,
  ImprovementBacklogItem,
  ImprovementSignal,
} from "./autonomous-improvement.types";

type RuntimeEnv = Record<string, string | undefined>;

type BuildReportInput = {
  env?: RuntimeEnv;
  now?: Date;
  mode?: AutonomousImprovementReport["mode"];
};

function isEnabled(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

function hasValue(env: RuntimeEnv, key: string) {
  return Boolean(env[key]?.trim());
}

function hasAll(env: RuntimeEnv, keys: string[]) {
  return keys.every((key) => hasValue(env, key));
}

function hasUsableResponsesProvider(env: RuntimeEnv) {
  return (
    hasValue(env, "AI_GATEWAY_API_KEY") ||
    hasValue(env, "OPENAI_API_KEY") ||
    hasValue(env, "KIMI_API_KEY") ||
    hasValue(env, "MOONSHOT_API_KEY")
  );
}

function hasUsableSupabaseMemory(env: RuntimeEnv) {
  return hasAll(env, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
}

function hasUsableRufloBridge(env: RuntimeEnv) {
  return isEnabled(env.RUFLO_ENABLED) && hasValue(env, "RUFLO_MCP_COMMAND");
}

function compactUrl(value: string | undefined) {
  const url = value?.trim();
  return url && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url)
    ? url.replace(/\/$/, "")
    : DEFAULT_RUFLO_REPOSITORY_URL;
}

function providerMode(env: RuntimeEnv): AutonomousImprovementReport["intelligence"]["expectedResponseMode"] {
  const preference = String(env.SAMUEL_AI_TEXT_PROVIDER ?? "auto").toLowerCase();
  if (
    ["kimi", "kimi-k3", "moonshot"].includes(preference) &&
    (hasValue(env, "KIMI_API_KEY") || hasValue(env, "MOONSHOT_API_KEY"))
  ) {
    return "kimi";
  }
  if (hasValue(env, "AI_GATEWAY_API_KEY")) return "gateway";
  if (hasValue(env, "KIMI_API_KEY") || hasValue(env, "MOONSHOT_API_KEY")) return "kimi";
  if (hasValue(env, "OPENAI_API_KEY")) return "openai";
  return "local_fallback";
}

function buildSignals(env: RuntimeEnv): ImprovementSignal[] {
  const providerConfigured = hasUsableResponsesProvider(env);
  const supabaseConfigured = hasUsableSupabaseMemory(env);
  const googleConfigured = hasAll(env, ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);
  const metaConfigured =
    hasAll(env, ["META_APP_ID", "META_APP_SECRET"]) ||
    (hasValue(env, "META_ACCESS_TOKEN") &&
      (hasValue(env, "META_PAGE_ID") ||
        hasValue(env, "META_AD_ACCOUNT_ID") ||
        hasValue(env, "META_INSTAGRAM_BUSINESS_ID")));
  const rufloConfigured = hasUsableRufloBridge(env);
  const cronSecretConfigured = hasValue(env, "SAMUEL_AUTONOMY_CRON_SECRET");

  const signals: ImprovementSignal[] = [
    {
      id: "catalog-ready",
      title: "Catálogo multiagente pronto",
      detail: `${SAMUEL_AUTONOMOUS_AGENTS.length} agentes especializados foram carregados para arquitetura, código, qualidade, segurança, performance, produto, crescimento, integrações, dados e operações.`,
      severity: "healthy",
      source: "Samuel Autonomous Engine",
      agentIds: ["operations-backlog-prioritizer-5", "architecture-principal-architect-1"],
      evidence: ["agent_catalog.total >= 60", "bridge_mode=proposal_only"],
    },
  ];

  signals.push(
    providerConfigured
      ? {
          id: "llm-provider-ready",
          title: "Motor de inteligência configurado",
          detail: "O Samuel pode enriquecer planos e conversas usando provider de IA configurado no servidor, incluindo Gateway, OpenAI ou Kimi K3.",
          severity: "healthy",
          source: "Environment capability scan",
          agentIds: ["data-learning-loop-agent-6", "product-samuel-personality-agent-3"],
          evidence: ["AI_GATEWAY_API_KEY, OPENAI_API_KEY, KIMI_API_KEY ou MOONSHOT_API_KEY presente"],
        }
      : {
          id: "llm-provider-missing",
          title: "Inteligência limitada ao fallback local",
          detail: "Sem chave de IA no servidor, o Samuel mantém diagnóstico determinístico, mas perde raciocínio generativo em melhorias complexas.",
          severity: "warning",
          source: "Environment capability scan",
          agentIds: ["data-learning-loop-agent-6", "operations-cost-control-agent-6"],
          evidence: [
            "AI_GATEWAY_API_KEY ausente",
            "OPENAI_API_KEY ausente",
            "KIMI_API_KEY/MOONSHOT_API_KEY ausente",
          ],
        },
  );

  if (!supabaseConfigured) {
    signals.push({
      id: "memory-persistence-missing",
      title: "Memória persistente incompleta",
      detail: "Sem Supabase completo, o loop aprende menos entre sessões e depende mais de estado local.",
      severity: "warning",
      source: "Environment capability scan",
      agentIds: ["data-memory-curation-agent-1", "data-company-brain-agent-2"],
      evidence: ["NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY não totalmente configurados"],
    });
  }

  if (!googleConfigured) {
    signals.push({
      id: "google-workspace-incomplete",
      title: "Google Workspace ainda exige OAuth",
      detail: "Gmail, Agenda e Drive precisam de credenciais OAuth para alimentar iniciativas reais do Samuel.",
      severity: "notice",
      source: "Integration capability scan",
      agentIds: [
        "integrations-gmail-integration-agent-1",
        "integrations-google-calendar-agent-2",
        "integrations-google-drive-agent-3",
      ],
      evidence: ["GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET pendentes"],
    });
  }

  if (!metaConfigured) {
    signals.push({
      id: "social-integrations-incomplete",
      title: "Meta/TikTok/WhatsApp exigem contas e tokens oficiais",
      detail: "O sistema pode preparar fluxos e deep links, mas publicação/gestão real depende de APIs comerciais aprovadas.",
      severity: "notice",
      source: "Integration capability scan",
      agentIds: [
        "integrations-whatsapp-business-agent-4",
        "integrations-meta-oauth-agent-5",
        "growth-tiktok-growth-agent-4",
      ],
      evidence: ["META_ACCESS_TOKEN/META_APP_ID/META_APP_SECRET não totalmente configurados"],
    });
  }

  signals.push(
    rufloConfigured
      ? {
          id: "ruflo-bridge-ready",
          title: "Ruflo bridge configurado",
          detail: "O Samuel está preparado para delegar swarms externos quando houver worker/CLI Ruflo disponível.",
          severity: "healthy",
          source: "Ruflo bridge",
          agentIds: ["operations-git-hub-pr-agent-3", "architecture-scalability-architect-7"],
          evidence: ["RUFLO_ENABLED=true", "RUFLO_MCP_COMMAND configurado"],
        }
      : {
          id: "ruflo-bridge-optional",
          title: "Ruflo bridge em modo catálogo",
          detail: "O Samuel usa catálogo interno agora; para executar Ruflo de verdade, configure um worker próprio com RUFLO_ENABLED e RUFLO_MCP_COMMAND.",
          severity: "notice",
          source: "Ruflo bridge",
          agentIds: ["operations-git-hub-pr-agent-3", "security-supply-chain-auditor-6"],
          evidence: ["Execução externa desativada ou comando ausente por segurança"],
        },
  );

  if (!cronSecretConfigured) {
    signals.push({
      id: "cron-secret-recommended",
      title: "Chave de cron recomendada",
      detail: "O endpoint é somente leitura por padrão; ações futuras de escrita devem exigir SAMUEL_AUTONOMY_CRON_SECRET.",
      severity: "notice",
      source: "Autonomy safety scan",
      agentIds: ["security-webhook-guard-agent-4", "operations-incident-commander-4"],
      evidence: ["SAMUEL_AUTONOMY_CRON_SECRET ausente"],
    });
  }

  return signals;
}

function priorityFor(signal: ImprovementSignal): ImprovementBacklogItem["priority"] {
  if (signal.severity === "critical") return "critical";
  if (signal.severity === "warning") return "high";
  if (signal.severity === "notice") return "medium";
  return "low";
}

function buildBacklog(signals: ImprovementSignal[]): ImprovementBacklogItem[] {
  const items = signals
    .filter((signal) => signal.severity !== "healthy")
    .map((signal): ImprovementBacklogItem => ({
      id: `backlog-${signal.id}`,
      title: signal.title,
      outcome: signal.detail,
      ownerAgentIds: signal.agentIds,
      priority: priorityFor(signal),
      effort: signal.id.includes("oauth") || signal.id.includes("integrations") ? "large" : "medium",
      canRunAutomatically: !signal.id.includes("token") && !signal.id.includes("oauth"),
      requiresHumanApproval: true,
    }));

  const baseItems: ImprovementBacklogItem[] = [
    {
      id: "backlog-speed-baseline",
      title: "Manter resposta rápida por padrão",
      outcome: "Usar roteamento determinístico para status/diagnósticos simples e reservar LLM para decisões complexas.",
      ownerAgentIds: [
        "performance-latency-profiler-1",
        "performance-streaming-optimizer-4",
        "operations-cost-control-agent-6",
      ],
      priority: "high",
      effort: "small",
      canRunAutomatically: true,
      requiresHumanApproval: false,
    },
    {
      id: "backlog-pr-reviewed-autonomy",
      title: "Executar melhorias internas via PR",
      outcome: "Todo patch de código proposto por agente deve sair como plano/PR, nunca como alteração invisível em produção.",
      ownerAgentIds: [
        "operations-git-hub-pr-agent-3",
        "security-sandbox-policy-agent-5",
        "quality-regression-test-agent-2",
      ],
      priority: "critical",
      effort: "medium",
      canRunAutomatically: false,
      requiresHumanApproval: true,
    },
  ];

  return [...baseItems, ...items].sort((left, right) => {
    const weight: Record<ImprovementBacklogItem["priority"], number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return weight[right.priority] - weight[left.priority] || left.title.localeCompare(right.title);
  });
}

export function buildAutonomousImprovementReport({
  env = process.env,
  now = new Date(),
  mode = "status",
}: BuildReportInput = {}): AutonomousImprovementReport {
  const providerConfigured = hasUsableResponsesProvider(env);
  const realtimeConfigured = hasAll(env, ["OPENAI_REALTIME_MODEL", "OPENAI_API_KEY"]);
  const memoryConfigured = hasUsableSupabaseMemory(env);
  const rufloBridgeConfigured = hasUsableRufloBridge(env);
  const signals = buildSignals(env);
  const backlog = buildBacklog(signals);
  const sourceUrl = compactUrl(env.RUFLO_REPOSITORY_URL ?? env.AGENT_CATALOG_REPOSITORY_URL);
  const integrationMode = rufloBridgeConfigured ? "bridge" : "catalog_only";
  const healthySignals = signals.filter((signal) => signal.severity === "healthy").length;
  const readiness = Math.round((healthySignals / Math.max(1, signals.length)) * 100);
  const hasGateway = providerMode(env) !== "local_fallback";

  return {
    id: `samuel-autonomy-${now.toISOString()}`,
    generatedAt: now.toISOString(),
    mode,
    sourceRepository: {
      name: "ruvnet/ruflo",
      url: sourceUrl,
      configured: rufloBridgeConfigured,
      integrationMode,
    },
    agentCatalog: {
      totalAgents: SAMUEL_AUTONOMOUS_AGENTS.length,
      activeAgents: SAMUEL_AUTONOMOUS_AGENTS.length,
      domains: countAgentsByDomain(),
      highlightedAgents: [
        "performance-latency-profiler-1",
        "data-learning-loop-agent-6",
        "operations-deploy-monitor-1",
        "security-prompt-injection-auditor-2",
        "product-hologram-experience-agent-4",
        "integrations-gmail-integration-agent-1",
      ].flatMap((id) => SAMUEL_AUTONOMOUS_AGENTS.find((agent) => agent.id === id) ?? []),
    },
    loop: {
      enabled: true,
      cadence: "hourly",
      runner: mode === "cron" ? "vercel_cron" : "manual",
      writeMode: "proposal_only",
      safety: [
        "Sem segredos expostos nas respostas.",
        "Sem execução de código externo no runtime público.",
        "Mudanças de código devem virar plano, teste e PR.",
        "Ações destrutivas ou integrações externas exigem aprovação humana.",
      ],
    },
    intelligence: {
      providerConfigured,
      realtimeConfigured,
      memoryConfigured,
      rufloBridgeConfigured,
      expectedResponseMode: providerMode(env),
    },
    performance: {
      estimatedLatencyPolicy: hasGateway ? "fast_default" : "configuration_required",
      parallelizationPotential: Math.min(100, 58 + Math.round(SAMUEL_AUTONOMOUS_AGENTS.length * 0.55)),
      cacheReadiness: memoryConfigured ? Math.max(70, readiness) : 42,
      bottlenecks: [
        ...(!providerConfigured ? ["Provider de IA ausente para raciocínio generativo avançado."] : []),
        ...(!memoryConfigured ? ["Memória persistente incompleta reduz aprendizagem entre execuções."] : []),
        ...(!rufloBridgeConfigured ? ["Ruflo externo ainda não está ligado a um worker dedicado."] : []),
      ],
    },
    signals,
    backlog,
    nextBestAction:
      backlog[0]?.title ??
      "Monitorar sinais reais e manter o Samuel em modo de melhoria contínua supervisionada.",
  };
}
