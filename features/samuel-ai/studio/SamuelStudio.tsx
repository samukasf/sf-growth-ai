"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  History,
  LoaderCircle,
  MonitorPlay,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/utils/cn";

import type {
  SamuelStudioGenerateRequest,
  SamuelStudioGenerateResponse,
  SamuelStudioProject,
  SamuelStudioProjectType,
  SamuelStudioStatus,
} from "./samuel-studio.types";

const StudioPreview = dynamic(
  () => import("./SamuelStudioPreview").then((module) => module.SamuelStudioPreview),
  {
    ssr: false,
    loading: () => (
      <div className="samuel-studio-preview-loading">
        <LoaderCircle aria-hidden="true" /> Preparando editor seguro…
      </div>
    ),
  },
);

const HISTORY_KEY = "sf-growth-ai:samuel-studio:projects";

const PROMPT_SUGGESTIONS = [
  "Site premium para uma consultoria de inteligência artificial com navegação completa e formulário local validado",
  "Aplicativo de CRM para acompanhar leads, etapas e próximas ações",
  "Landing page tecnológica para lançamento de um serviço executivo",
];

function readProjects() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const projects = JSON.parse(stored) as SamuelStudioProject[];
    return Array.isArray(projects) ? projects.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "samuel-project";
}

async function downloadProject(project: SamuelStudioProject) {
  const { strToU8, zipSync } = await import("fflate");
  const appCode = project.files["/App.js"] ?? "export default function App(){return null}";
  const styles = project.files["/styles.css"] ?? "";
  const data = project.files["/data.js"];
  const entries: Record<string, Uint8Array> = {
    "package.json": strToU8(JSON.stringify({
      name: slug(project.name),
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: { "@vitejs/plugin-react": "latest", vite: "latest", react: "latest", "react-dom": "latest" },
      devDependencies: {},
    }, null, 2)),
    "index.html": strToU8('<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Samuel Studio</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>'),
    "src/main.jsx": strToU8('import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\ncreateRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);'),
    "src/App.jsx": strToU8(appCode.replace('./styles.css', './styles.css')),
    "src/styles.css": strToU8(styles),
    "README.md": strToU8(`# ${project.name}\n\n${project.summary}\n\nGerado pelo Samuel Studio.\n\n## Executar\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`),
  };
  if (data) entries["src/data.js"] = strToU8(data);
  const zipped = zipSync(entries, { level: 6 });
  const buffer = zipped.buffer.slice(
    zipped.byteOffset,
    zipped.byteOffset + zipped.byteLength,
  ) as ArrayBuffer;
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/zip" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug(project.name)}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SamuelStudio() {
  const [type, setType] = useState<SamuelStudioProjectType>("site");
  const [brief, setBrief] = useState("");
  const [changeRequest, setChangeRequest] = useState("");
  const [project, setProject] = useState<SamuelStudioProject | null>(null);
  const [projects, setProjects] = useState<SamuelStudioProject[]>([]);
  const [status, setStatus] = useState<SamuelStudioStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const historyTimer = window.setTimeout(() => setProjects(readProjects()), 0);
    const controller = new AbortController();
    void fetch("/api/samuel-ai/studio", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status indisponível");
        setStatus(await response.json() as SamuelStudioStatus);
      })
      .catch(() => undefined);
    return () => {
      window.clearTimeout(historyTimer);
      controller.abort();
    };
  }, []);

  const saveProject = useCallback((next: SamuelStudioProject) => {
    setProject(next);
    setProjects((current) => {
      const updated = [next, ...current.filter((item) => item.id !== next.id)].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // The editor remains usable if private browsing blocks local persistence.
      }
      return updated;
    });
  }, []);

  const updateProjectFiles = useCallback((files: Record<string, string>) => {
    setProject((current) => current ? { ...current, files } : current);
  }, []);

  async function generate(mode: "create" | "refine") {
    const requestBrief = brief.trim();
    if (requestBrief.length < 12) {
      setError("Descreva o que o Samuel deve criar com um pouco mais de detalhe.");
      return;
    }
    if (mode === "refine" && (!project || changeRequest.trim().length < 4)) {
      setError("Escreva a melhoria que deseja aplicar ao projeto atual.");
      return;
    }

    setGenerating(true);
    setError(null);
    setWarning(null);
    try {
      const payload: SamuelStudioGenerateRequest = {
        type,
        brief: requestBrief,
        mode,
        changeRequest: mode === "refine" ? changeRequest : undefined,
        existingProject: mode === "refine" ? project ?? undefined : undefined,
      };
      const response = await fetch("/api/samuel-ai/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as SamuelStudioGenerateResponse & { error?: string };
      if (!response.ok || !result.project) {
        throw new Error(result.error ?? "O Samuel não conseguiu gerar o projeto.");
      }
      saveProject(result.project);
      setWarning(result.warning ?? null);
      setChangeRequest("");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Falha ao gerar o projeto.");
    } finally {
      setGenerating(false);
    }
  }

  const activeProvider = useMemo(
    () => status?.engines.find((engine) => engine.id === "gateway"),
    [status],
  );

  return (
    <div className="samuel-studio">
      <section className="samuel-studio-hero">
        <div className="samuel-studio-hero__grid" aria-hidden="true" />
        <div className="samuel-studio-hero__copy">
          <span><WandSparkles aria-hidden="true" /> Samuel Studio</span>
          <h2>Crie sites e aplicativos com o Samuel.</h2>
          <p>
            Descreva a ideia. O Gateway entrega uma experiência navegável, executada no celular, que você pode testar em tela cheia, melhorar e baixar.
          </p>
          <div className="samuel-studio-hero__badges">
            <span><Check /> Gateway no servidor</span>
            <span><ShieldCheck /> Prévia isolada</span>
            <span><MonitorPlay /> Navegação funcional</span>
          </div>
        </div>
        <div className="samuel-studio-orb" aria-hidden="true">
          <i /><i /><i />
          <Bot />
        </div>
      </section>

      <section className="samuel-studio-composer">
        <div className="samuel-studio-composer__top">
          <div>
            <span>Novo projeto</span>
            <h3>O que devemos construir?</h3>
          </div>
          <div className="samuel-studio-type-toggle" role="group" aria-label="Tipo de projeto">
            <button type="button" onClick={() => setType("site")} className={cn(type === "site" && "is-active")}>
              <MonitorPlay /> Site
            </button>
            <button type="button" onClick={() => setType("app")} className={cn(type === "app" && "is-active")}>
              <AppWindow /> Aplicativo
            </button>
          </div>
        </div>
        <textarea
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          placeholder="Ex.: Crie um aplicativo executivo para organizar clientes, tarefas e prioridades, com visual azul tecnológico…"
          aria-label="Descrição do projeto"
          disabled={generating}
        />
        <div className="samuel-studio-suggestions">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => setBrief(suggestion)}>
              <Sparkles /> {suggestion}
            </button>
          ))}
        </div>
        <div className="samuel-studio-composer__footer">
          <p>
            <span className={cn(activeProvider?.status === "active" && "is-online")} />
            {activeProvider?.status === "active" ? "GPT-OSS via Gateway conectado" : "Base local disponível"}
          </p>
          <button type="button" onClick={() => void generate("create")} disabled={generating} className="samuel-studio-generate">
            {generating ? <LoaderCircle className="animate-spin" /> : <WandSparkles />}
            {generating ? "Samuel está construindo…" : "Gerar projeto"}
          </button>
        </div>
        {error && <p className="samuel-studio-feedback is-error">{error}</p>}
        {warning && <p className="samuel-studio-feedback is-warning">{warning}</p>}
      </section>

      {project && (
        <section className="samuel-studio-result">
          <div className="samuel-studio-result__header">
            <div>
              <span>{project.type === "site" ? "SITE GERADO" : "APLICATIVO GERADO"}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
            </div>
            <div className="samuel-studio-result__actions">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(Object.entries(project.files).map(([path, code]) => `// ${path}\n${code}`).join("\n\n"));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1_500);
                }}
              >
                {copied ? <Check /> : <Copy />} {copied ? "Copiado" : "Copiar código"}
              </button>
              <button type="button" onClick={() => void downloadProject(project)} className="is-primary">
                <Download /> Baixar ZIP
              </button>
            </div>
          </div>
          <StudioPreview key={project.id} files={project.files} onFilesChange={updateProjectFiles} />
          <div className="samuel-studio-refine">
            <div>
              <span><RefreshCw /> Evoluir projeto</span>
              <p>Peça uma alteração e o Samuel reconstruirá os arquivos preservando a ideia atual.</p>
            </div>
            <input
              value={changeRequest}
              onChange={(event) => setChangeRequest(event.target.value)}
              placeholder="Ex.: deixe o menu mais sofisticado e adicione uma seção de preços"
              disabled={generating}
            />
            <button type="button" onClick={() => void generate("refine")} disabled={generating}>
              {generating ? <LoaderCircle className="animate-spin" /> : <ChevronRight />} Aplicar melhoria
            </button>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="samuel-studio-history">
          <div className="samuel-studio-section-title"><History /><div><span>Histórico local</span><h3>Projetos recentes</h3></div></div>
          <div>
            {projects.map((item) => (
              <button key={item.id} type="button" onClick={() => { setProject(item); setType(item.type); setBrief(item.summary); }}>
                <span>{item.type === "site" ? <MonitorPlay /> : <AppWindow />}</span>
                <div><strong>{item.name}</strong><p>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</p></div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="samuel-studio-engines">
        <div className="samuel-studio-section-title"><Code2 /><div><span>Ecossistema aberto</span><h3>Motores integrados</h3></div></div>
        <div className="samuel-studio-engines__grid">
          {(status?.engines ?? [
            { id: "gateway", label: "GPT-OSS via Gateway", status: "ready", detail: "Motor de geração no servidor." },
            { id: "sandpack", label: "Sandpack Preview", status: "active", detail: "Editor React isolado." },
            { id: "piper", label: "Piper Voice pt-BR", status: "active", detail: "Voz neural no aparelho." },
            { id: "openhands", label: "OpenHands", status: "configuration_required", detail: "Backend autônomo opcional." },
          ] as SamuelStudioStatus["engines"]).map((engine) => (
            <article key={engine.id}>
              <div><span>{engine.id === "gateway" ? <Sparkles /> : engine.id === "sandpack" ? <Code2 /> : engine.id === "piper" ? <Bot /> : <AppWindow />}</span><i className={cn(engine.status === "active" && "is-active", engine.status === "ready" && "is-ready")} /></div>
              <h4>{engine.label}</h4>
              <p>{engine.detail}</p>
              <strong>{engine.status === "active" ? "ATIVO" : engine.status === "ready" ? "PRONTO" : "CONFIGURAÇÃO NECESSÁRIA"}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
