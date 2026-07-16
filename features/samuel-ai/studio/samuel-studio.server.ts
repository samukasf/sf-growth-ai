import type {
  SamuelStudioGenerateRequest,
  SamuelStudioProject,
  SamuelStudioProjectType,
} from "./samuel-studio.types";

const ALLOWED_FILES = new Set(["/App.js", "/styles.css", "/data.js"]);
const MAX_TOTAL_SOURCE_SIZE = 90_000;
const BLOCKED_SOURCE = [
  /\bfetch\s*\(/i,
  /\bXMLHttpRequest\b/i,
  /\bWebSocket\b/i,
  /\bEventSource\b/i,
  /\bsendBeacon\b/i,
  /document\.cookie/i,
  /window\.(?:parent|top|opener)/i,
  /\beval\s*\(/i,
  /new\s+Function\s*\(/i,
  /@import\b/i,
  /https?:\/\//i,
];

export const SAMUEL_STUDIO_TEXT_FORMAT = {
  type: "json_schema",
  name: "samuel_studio_project",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      summary: { type: "string" },
      files: {
        type: "object",
        properties: {
          "/App.js": { type: "string" },
          "/styles.css": { type: "string" },
          "/data.js": { type: "string" },
        },
        required: ["/App.js", "/styles.css", "/data.js"],
        additionalProperties: false,
      },
    },
    required: ["name", "summary", "files"],
    additionalProperties: false,
  },
} as const;

type GeneratedPayload = {
  name?: unknown;
  summary?: unknown;
  files?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

export function studioFailureDiagnostic(error: unknown) {
  const message = error instanceof Error ? error.message : "Falha desconhecida.";
  return message
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [protegido]")
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[chave protegida]")
    .replace(/organization\s+`[^`]+`/gi, "organization `[protegida]`")
    .replace(/https?:\/\/\S+/gi, "[endereço protegido]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240) || "Falha desconhecida.";
}

export function shouldRetryStudioWithoutSchema(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (!message) return false;
  if (
    message.includes("rate limit") ||
    message.includes("tokens per minute") ||
    message.includes("request too large") ||
    message.includes("capacidade externa")
  ) {
    return false;
  }
  return (
    message.includes("unsupported") ||
    message.includes("unknown parameter") ||
    message.includes("text.format") ||
    message.includes("json_schema") ||
    message.includes("json válido") ||
    message.includes("não contém arquivos") ||
    message.includes("precisa conter") ||
    message.includes("export default")
  );
}

function sanitizeGeneratedCss(source: string) {
  return source
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/url\(\s*(["']?)https?:\/\/[^)]*\1\s*\)/gi, "none")
    .trim();
}

function projectNameFromBrief(brief: string) {
  const words = brief
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  return words.length > 0 ? words.join(" ") : "Novo projeto Samuel";
}

function extractJsonObject(content: string) {
  const withoutFence = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu um projeto JSON válido.");
  return JSON.parse(withoutFence.slice(start, end + 1)) as GeneratedPayload;
}

function normalizeFiles(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("O projeto gerado não contém arquivos válidos.");
  }

  const files: Record<string, string> = {};
  let totalSize = 0;

  for (const [rawPath, rawCode] of Object.entries(value)) {
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    if (!ALLOWED_FILES.has(path) || typeof rawCode !== "string") continue;
    const code = path === "/styles.css" ? sanitizeGeneratedCss(rawCode) : rawCode;
    if (BLOCKED_SOURCE.some((pattern) => pattern.test(code))) {
      throw new Error(`O arquivo ${path} tentou usar uma capacidade externa não permitida.`);
    }
    totalSize += code.length;
    if (totalSize > MAX_TOTAL_SOURCE_SIZE) {
      throw new Error("O projeto gerado excedeu o limite seguro de código.");
    }
    files[path] = code.trim();
  }

  if (!files["/App.js"] || !files["/styles.css"]) {
    throw new Error("O projeto precisa conter /App.js e /styles.css.");
  }
  if (!/export\s+default/.test(files["/App.js"])) {
    throw new Error("O componente principal não possui export default.");
  }
  if (!/styles\.css/.test(files["/App.js"])) {
    files["/App.js"] = `import "./styles.css";\n${files["/App.js"]}`;
  }

  return files;
}

export function parseGeneratedStudioProject(
  content: string,
  input: {
    id: string;
    type: SamuelStudioProjectType;
    provider: string;
    model: string | null;
    createdAt: string;
    fallbackName: string;
  },
): SamuelStudioProject {
  const payload = extractJsonObject(content);
  const name = cleanText(payload.name, 72) || input.fallbackName;
  const summary = cleanText(payload.summary, 360) || "Projeto criado pelo Samuel Studio.";

  return {
    id: input.id,
    type: input.type,
    name,
    summary,
    files: normalizeFiles(payload.files),
    provider: input.provider,
    model: input.model,
    createdAt: input.createdAt,
  };
}

export function validateStudioRequest(value: unknown): SamuelStudioGenerateRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Pedido inválido.");
  }
  const input = value as Partial<SamuelStudioGenerateRequest>;
  if (input.type !== "site" && input.type !== "app") {
    throw new Error("Escolha site ou aplicativo.");
  }
  const brief = cleanText(input.brief, 4_000);
  if (brief.length < 12) {
    throw new Error("Descreva o projeto com pelo menos 12 caracteres.");
  }
  const mode = input.mode === "refine" ? "refine" : "create";
  const changeRequest = cleanText(input.changeRequest, 2_000);
  if (mode === "refine" && (!input.existingProject || changeRequest.length < 4)) {
    throw new Error("Informe o projeto e a melhoria desejada.");
  }

  return {
    type: input.type,
    brief,
    mode,
    changeRequest,
    existingProject: mode === "refine" ? input.existingProject : undefined,
  };
}

export function buildStudioPrompt(input: SamuelStudioGenerateRequest) {
  const base = [
    `Crie um ${input.type === "site" ? "site responsivo" : "aplicativo web responsivo"} executável em React.`,
    `Brief do usuário: ${input.brief}`,
    "Entregue SOMENTE JSON válido, sem markdown, no formato:",
    '{"name":"Nome curto","summary":"Resumo curto","files":{"/App.js":"código","/styles.css":"css","/data.js":""}}',
    "Regras obrigatórias:",
    "- use React puro e CSS, sem TypeScript e sem dependências externas;",
    "- /App.js deve importar ./styles.css e exportar default;",
    "- sempre devolva /data.js; use uma string vazia quando ele não for necessário;",
    "- crie uma experiência visual premium, tecnológica, acessível e mobile-first;",
    "- o resultado será aberto primeiro como produto navegável, não como bloco de código;",
    "- todos os menus, separadores, botões, CTAs e formulários visíveis devem responder de verdade; não crie controlos mortos;",
    "- sites devem navegar entre secções ou páginas visíveis; aplicativos devem ter pelo menos três áreas acessíveis por menu ou abas;",
    "- use estado React e persistência local quando necessário para criar, editar, concluir, filtrar e remover itens;",
    "- formulários sem backend devem validar os campos e guardar o rascunho localmente, sem alegar envio externo;",
    "- não use fetch, WebSocket, EventSource, XMLHttpRequest, cookies, eval, window.parent/top/opener nem recursos remotos;",
    "- não invente integrações, pagamentos ou envio externo de formulários; identifique claramente ações que funcionam apenas no estado local;",
    "- mantenha o total compacto o suficiente para caber em 6.000 tokens.",
  ];

  if (input.mode === "refine" && input.existingProject) {
    base.push(
      "Aprimore o projeto existente preservando o que já funciona.",
      `Alteração solicitada: ${input.changeRequest}`,
      `Projeto atual: ${JSON.stringify({
        name: input.existingProject.name,
        summary: input.existingProject.summary,
        files: input.existingProject.files,
      })}`,
    );
  }

  return base.join("\n");
}

export function createStarterStudioProject(input: {
  id: string;
  type: SamuelStudioProjectType;
  brief: string;
  createdAt: string;
  warningProvider?: string;
}): SamuelStudioProject {
  const name = projectNameFromBrief(input.brief);
  const briefLiteral = JSON.stringify(input.brief);
  const appCode = input.type === "app"
    ? `import { useMemo, useState } from "react";
import "./styles.css";

export default function App() {
  const [items, setItems] = useState(["Definir a primeira prioridade", "Revisar o projeto com Samuel"]);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState("overview");
  const completed = useMemo(() => Math.max(12, 100 - items.length * 14), [items.length]);
  function addItem(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setItems((current) => [...current, draft.trim()]);
    setDraft("");
  }
  return <main className="app-shell">
    <header><span>SAMUEL STUDIO</span><nav>{[["overview","Visão"],["plan","Plano"],["settings","Definições"]].map(([id,label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>)}</nav><strong>ONLINE</strong></header>
    {view === "overview" && <><section className="hero"><p>APLICATIVO EXECUTÁVEL</p><h1>${name}</h1><div className="brief">{${briefLiteral}}</div><button className="cta" onClick={() => setView("plan")}>Abrir plano</button></section><section className="dashboard"><article className="score"><b>{completed}%</b><span>progresso atual</span></article><article className="workspace"><h2>Resumo</h2><p>O aplicativo está navegável e pronto para receber os dados e integrações do projeto.</p></article></section></>}
    {view === "plan" && <section className="dashboard"><article className="score"><b>{items.length}</b><span>etapas abertas</span></article><article className="workspace"><h2>Plano de execução</h2><form onSubmit={addItem}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nova etapa"/><button>Adicionar</button></form><ul>{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}<button onClick={() => setItems((current) => current.filter((entry) => entry !== item))}>Concluir</button></li>)}</ul></article></section>}
    {view === "settings" && <section className="hero"><p>DEFINIÇÕES</p><h1>Personalize a operação.</h1><div className="brief">As preferências deste protótipo permanecem no estado local durante a navegação.</div><button className="cta" onClick={() => setView("overview")}>Voltar à visão geral</button></section>}
  </main>;
}`
    : `import "./styles.css";

export default function App() {
  return <main className="app-shell">
    <nav><span className="brand">${name}</span><div><a href="#solucao">Solução</a><a href="#contato">Contato</a></div></nav>
    <section className="hero"><p>SITE CRIADO PELO SAMUEL STUDIO</p><h1>Transforme uma ideia em uma experiência digital marcante.</h1><div className="brief">{${briefLiteral}}</div><a className="cta" href="#solucao">Conhecer a solução</a></section>
    <section id="solucao" className="features">{["Estratégia clara", "Design responsivo", "Experiência objetiva"].map((item, index) => <article key={item}><span>0{index + 1}</span><h2>{item}</h2><p>Uma base profissional pronta para ser personalizada e publicada.</p></article>)}</section>
    <footer id="contato"><strong>${name}</strong><span>Projeto navegável · Samuel Studio</span></footer>
  </main>;
}`;

  return {
    id: input.id,
    type: input.type,
    name,
    summary: "Base funcional criada localmente enquanto o Gateway não respondeu.",
    provider: input.warningProvider ?? "samuel-starter",
    model: null,
    createdAt: input.createdAt,
    files: {
      "/App.js": appCode,
      "/styles.css": `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#eaf6ff;background:#030916}.app-shell{min-height:100vh;background:radial-gradient(circle at 80% 0,#123a8a88,transparent 34%),linear-gradient(145deg,#030916,#071936)}nav,header,footer{display:flex;align-items:center;justify-content:space-between;padding:24px clamp(20px,6vw,84px);border-bottom:1px solid #80eaff22}.brand,header span{font-weight:800;letter-spacing:.12em}nav{gap:8px;padding:0;border:0}nav div{display:flex;gap:24px}nav button{border:1px solid #7ee8ff22;border-radius:999px;padding:9px 14px;color:#91abd0;background:transparent}nav button.active{color:#031027;background:#72edff}a{color:#b9d8ff;text-decoration:none}.hero{padding:clamp(70px,12vw,150px) clamp(20px,8vw,120px);max-width:1150px}.hero>p{color:#69e7ff;font-size:12px;letter-spacing:.18em}.hero h1{max-width:850px;margin:16px 0;font-size:clamp(42px,8vw,92px);line-height:.94;background:linear-gradient(90deg,#fff,#7ee8ff,#799cff);background-clip:text;color:transparent}.brief{max-width:720px;color:#a9c5e8;line-height:1.7}.cta,form button{display:inline-flex;margin-top:28px;border:0;border-radius:999px;padding:14px 22px;color:#031027;background:linear-gradient(90deg,#72edff,#7795ff);font-weight:800}.features,.dashboard{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:30px clamp(20px,8vw,120px) 90px}.features article,.score,.workspace{border:1px solid #7ee8ff2c;border-radius:24px;padding:28px;background:#ffffff09;box-shadow:inset 0 1px #ffffff16}.features span{color:#6ee7ff}.features p,footer span,.workspace p{color:#91abd0;line-height:1.7}.dashboard{grid-template-columns:minmax(180px,.35fr) 1fr}.score{display:flex;flex-direction:column;justify-content:center;align-items:center}.score b{font-size:64px;color:#7be9ff}.score span{color:#90abd2}.workspace h2{margin-top:0}.workspace form{display:flex;gap:10px}.workspace input{flex:1;min-width:0;border:1px solid #73e6ff33;border-radius:12px;padding:13px;color:#fff;background:#07152d}.workspace form button{margin:0;border-radius:12px}.workspace ul{display:grid;gap:10px;padding:0;list-style:none}.workspace li{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;border-top:1px solid #ffffff14;padding:14px 0}.workspace li span{color:#66e4ff}.workspace li button{border:1px solid #6feaff30;border-radius:999px;padding:7px 10px;color:#8deeff;background:transparent}footer{border-top:1px solid #80eaff22;border-bottom:0}@media(max-width:700px){header{align-items:flex-start;gap:14px;flex-wrap:wrap}header nav{order:3;width:100%;overflow:auto}header nav button{flex:1}.features,.dashboard{grid-template-columns:1fr}.hero{padding-top:84px}.workspace form{flex-direction:column}.workspace form button{width:100%}}`,
    },
  };
}
