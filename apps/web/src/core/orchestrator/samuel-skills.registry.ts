export type SamuelSkillRisk = "read" | "write" | "sensitive";

export type SamuelSkill = {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  triggers: RegExp[];
  risk: SamuelSkillRisk;
  surfaces: string[];
};

export const SAMUEL_SKILLS: readonly SamuelSkill[] = [
  {
    id: "conversation",
    name: "Conversa contínua",
    description: "Mantém uma única sessão entre texto e voz, com histórico e interrupção.",
    capabilities: ["conversation", "voice", "history"],
    triggers: [/./],
    risk: "read",
    surfaces: ["chat", "voice"],
  },
  {
    id: "memory",
    name: "Memória contextual",
    description: "Recupera contexto empresarial, histórico e memórias relevantes sem inventar factos.",
    capabilities: ["memory", "context", "recall"],
    triggers: [/lembr|mem[oó]ria|hist[oó]ric|context|falamos|antes/i],
    risk: "read",
    surfaces: ["chat"],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Consulta e prepara ações de e-mail; alterações exigem confirmação quando aplicável.",
    capabilities: ["email.search", "email.read", "email.draft", "email.send"],
    triggers: [/e-?mail|gmail|mensagem|caixa de entrada|responder|enviar/i],
    risk: "write",
    surfaces: ["gmail", "chat", "voice"],
  },
  {
    id: "calendar",
    name: "Google Agenda",
    description: "Consulta agenda e prepara criação, alteração ou cancelamento de eventos.",
    capabilities: ["calendar.read", "calendar.create", "calendar.update", "calendar.delete"],
    triggers: [/agenda|calend[aá]rio|evento|reuni[aã]o|marcar|agendar/i],
    risk: "write",
    surfaces: ["calendar", "chat", "voice"],
  },
  {
    id: "desktop",
    name: "Samuel Desktop",
    description: "Executa tarefas verificáveis no computador autorizado.",
    capabilities: ["computer", "files", "browser", "apps"],
    triggers: [/computador|windows|arquivo|ficheiro|pasta|abrir|clicar|desktop/i],
    risk: "sensitive",
    surfaces: ["desktop", "chat", "voice"],
  },
  {
    id: "content",
    name: "Conteúdo e vídeo",
    description: "Cria roteiros, cenas, narração, composições e materiais para redes sociais.",
    capabilities: ["content", "video", "remotion", "tts", "social"],
    triggers: [/v[ií]deo|reel|short|post|conte[uú]do|roteiro|narra[cç][aã]o|remotion/i],
    risk: "write",
    surfaces: ["studio", "chat"],
  },
  {
    id: "site-builder",
    name: "Sites e Apps",
    description: "Planeia, cria e publica experiências web usando o construtor do Samuel.",
    capabilities: ["website", "app", "publish"],
    triggers: [/site|website|landing|app|aplicativo|p[aá]gina|dom[ií]nio/i],
    risk: "write",
    surfaces: ["site-builder", "chat"],
  },
  {
    id: "crm",
    name: "CRM e Leads",
    description: "Organiza clientes, leads e oportunidades comerciais.",
    capabilities: ["crm", "lead", "sales"],
    triggers: [/cliente|lead|crm|prospec[cç][aã]o|empresa|venda|oportunidade/i],
    risk: "write",
    surfaces: ["crm", "chat"],
  },
  {
    id: "live-web",
    name: "Internet em tempo real",
    description: "Consulta a web ao vivo para dados atuais como clima, notícias, preços, horários e resultados.",
    capabilities: ["web.search", "web.sources", "weather", "fresh-data"],
    triggers: [/internet|web|online|tempo real|agora|hoje|encontre|localize|previs[aã]o|meteorolog|clima|not[ií]cia|pre[cç]o|cota[cç][aã]o|hor[aá]rio|resultado|placar/i],
    risk: "read",
    surfaces: ["chat", "voice", "research"],
  },
  {
    id: "research",
    name: "Pesquisa",
    description: "Pesquisa e consolida informação para apoiar decisões e tarefas.",
    capabilities: ["research", "analysis", "watchers"],
    triggers: [/pesquis|procure|encontre|investigue|analise|concorrente/i],
    risk: "read",
    surfaces: ["watchers", "chat"],
  },
  {
    id: "marketing",
    name: "Marketing e anúncios",
    description: "Analisa campanhas e encaminha ações de marketing e publicidade.",
    capabilities: ["marketing", "ads", "analytics"],
    triggers: [/an[uú]ncio|ads|campanha|marketing|meta|google ads|publicidade/i],
    risk: "write",
    surfaces: ["marketing", "chat"],
  },
] as const;

export type SamuelSelectedSkill = Pick<
  SamuelSkill,
  "id" | "name" | "description" | "capabilities" | "risk" | "surfaces"
>;

function scoreSkill(skill: SamuelSkill, query: string) {
  if (skill.id === "conversation") return 1;
  return skill.triggers.reduce(
    (score, trigger) => score + (trigger.test(query) ? 1 : 0),
    0,
  );
}

export function selectSamuelSkills(
  query: string,
  limit = 5,
): SamuelSelectedSkill[] {
  const clean = query.trim();
  return SAMUEL_SKILLS
    .map((skill) => ({ skill, score: scoreSkill(skill, clean) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit))
    .map(({ skill }) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      capabilities: [...skill.capabilities],
      risk: skill.risk,
      surfaces: [...skill.surfaces],
    }));
}

export function formatSamuelSkillContext(
  skills: readonly SamuelSelectedSkill[],
) {
  if (!skills.length) return "";

  return [
    "[SAMUEL SKILLS — CAPACIDADES DISPONÍVEIS]",
    ...skills.map(
      (skill) =>
        `- ${skill.name} (${skill.id}; risco ${skill.risk}): ${skill.description} Capacidades: ${skill.capabilities.join(", ")}.`,
    ),
    "Estas skills descrevem capacidades, não provam execução. Só afirme que uma ação ocorreu quando houver resultado/evidência explícita da ferramenta correspondente.",
  ].join("\n");
}
