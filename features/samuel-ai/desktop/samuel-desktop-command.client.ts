type DesktopCommandCreated = {
  ok: true;
  commandId: string;
  deviceName: string;
};

type DesktopCommandStatus = {
  terminal: boolean;
  verified: boolean;
  command: {
    status: string;
    result?: unknown;
    evidence?: unknown;
    error_message?: string | null;
  };
};

const EXECUTION_VERB = /\b(abra|abrir|acesse|acessar|entre|entrar|clique|clicar|digite|digitar|preencha|preencher|baixe|baixar|envie|enviar|faça|fazer|execute|executar|procure|procurar|crie|criar|salve|salvar|feche|fechar)\b/i;
const DESKTOP_TARGET = /\b(no meu computador|no computador|no pc|no windows|na minha tela|na area de trabalho|na área de trabalho|chrome|edge|firefox|explorador de arquivos|word|excel|powerpoint)\b/i;

export function isDesktopExecutionRequest(text: string) {
  return EXECUTION_VERB.test(text) && DESKTOP_TARGET.test(text);
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Falha no Samuel Desktop.");
  return payload;
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Operação cancelada.", "AbortError"));
    }, { once: true });
  });
}

export async function runSamuelDesktopCommand(input: {
  companyId: string;
  goal: string;
  signal: AbortSignal;
}) {
  const response = await fetch("/api/samuel-desktop/voice-command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId: input.companyId, goal: input.goal }),
    signal: input.signal,
  });
  const created = await readJson<DesktopCommandCreated>(response);
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120_000) {
    await wait(1_500, input.signal);
    const statusResponse = await fetch(
      `/api/samuel-desktop/voice-command?commandId=${encodeURIComponent(created.commandId)}`,
      { cache: "no-store", signal: input.signal },
    );
    const status = await readJson<DesktopCommandStatus>(statusResponse);
    if (!status.terminal) continue;
    if (status.verified) {
      return `Tarefa concluída e verificada no computador ${created.deviceName}. A execução devolveu evidência visual.`;
    }
    throw new Error(status.command.error_message || `A tarefa terminou com estado ${status.command.status}, sem confirmação visual.`);
  }

  return `A tarefa foi enviada ao computador ${created.deviceName} e continua em execução. Acompanhe o resultado em Meu computador; ainda não há evidência de conclusão.`;
}
