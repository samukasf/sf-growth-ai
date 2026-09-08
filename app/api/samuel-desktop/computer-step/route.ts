import { authenticateDesktopDevice, appendDesktopEvent } from "@/features/samuel-desktop/server/desktop-agent.server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SCREENSHOT_CHARS = 14_000_000;
const MAX_HISTORY = 20;

function jsonError(message: string, status: number, code: string) {
  return Response.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const output = (payload as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return "";
  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown[] }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((part) =>
      part && typeof part === "object" && (part as { type?: string }).type === "output_text"
        ? String((part as { text?: unknown }).text ?? "")
        : "",
    )
    .join("");
}

export async function POST(request: Request) {
  const device = await authenticateDesktopDevice(request);
  if (!device || device.status !== "paired" || !device.user_id) {
    return jsonError("Dispositivo não autorizado ou não pareado.", 401, "DEVICE_UNAUTHORIZED");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("JSON inválido.", 400, "INVALID_JSON");
  }

  const commandId = String(body.commandId ?? "").trim();
  const goal = String(body.goal ?? "").trim().slice(0, 4000);
  const screenshot = String(body.screenshot ?? "");
  const width = Math.max(320, Math.min(7680, Number(body.width) || 1920));
  const height = Math.max(240, Math.min(4320, Number(body.height) || 1080));
  const step = Math.max(0, Math.min(60, Number(body.step) || 0));
  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];

  if (!commandId || !goal) return jsonError("commandId e goal são obrigatórios.", 400, "COMPUTER_TASK_INVALID");
  if (!screenshot.startsWith("data:image/") || screenshot.length > MAX_SCREENSHOT_CHARS) {
    return jsonError("Screenshot inválido ou demasiado grande.", 400, "SCREENSHOT_INVALID");
  }

  const service = getSupabaseServiceClient();
  const { data: command, error: commandError } = await service
    .from("samuel_desktop_commands")
    .select("id,device_id,user_id,action,args,risk,status,approval_reference,expires_at")
    .eq("id", commandId)
    .eq("device_id", device.id)
    .eq("user_id", device.user_id)
    .maybeSingle();

  if (commandError) return jsonError(commandError.message, 500, "COMMAND_LOOKUP_FAILED");
  if (!command || command.action !== "computer.task" || command.status !== "running") {
    return jsonError("Não existe tarefa de computer use ativa para este comando.", 409, "COMPUTER_TASK_NOT_ACTIVE");
  }
  if (!command.approval_reference || command.risk !== "sensitive") {
    return jsonError("A tarefa não possui confirmação sensível válida.", 409, "COMPUTER_TASK_NOT_APPROVED");
  }
  if (Date.parse(command.expires_at) <= Date.now()) {
    return jsonError("A tarefa expirou.", 409, "COMPUTER_TASK_EXPIRED");
  }

  const storedGoal =
    command.args && typeof command.args === "object"
      ? String((command.args as Record<string, unknown>).goal ?? "").trim()
      : "";
  if (storedGoal && storedGoal !== goal) {
    return jsonError("O objetivo não corresponde ao comando aprovado.", 409, "COMPUTER_GOAL_MISMATCH");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError("OPENAI_API_KEY não configurada.", 503, "COMPUTER_MODEL_NOT_CONFIGURED");
  const model =
    process.env.OPENAI_COMPUTER_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-5.6-sol";

  const historyText = history
    .map((item, index) => `${index + 1}. ${JSON.stringify(item).slice(0, 800)}`)
    .join("\n");

  const instruction = [
    "Você é o controlador visual do Samuel Desktop no Windows.",
    `Objetivo aprovado pelo usuário: ${goal}`,
    `Tela atual: ${width}x${height}. Passo: ${step}.`,
    "Escolha exatamente UMA próxima ação com base apenas na imagem atual e no histórico.",
    "Use coordenadas em pixels da imagem atual. Prefira alvos centrais e inequívocos.",
    "Depois de cada clique/tecla haverá uma nova captura; portanto não antecipe múltiplos passos.",
    "Só use done quando a tela contiver evidência visível de que o objetivo foi concluído.",
    "Se o objetivo exigir senha, CAPTCHA, biometria, 2FA, pagamento, alteração de segurança ou outra intervenção humana que não esteja já visivelmente autorizada, use fail e explique o takeover necessário.",
    "Nunca tente descobrir, copiar ou devolver senhas/chaves. Não clique em anúncios ou elementos irrelevantes.",
    historyText ? `Histórico recente:\n${historyText}` : "Sem histórico anterior.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": `samuel-desktop-${device.id}`,
    },
    body: JSON.stringify({
      model,
      instructions: instruction,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Determine o próximo passo na tela atual." },
            { type: "input_image", image_url: screenshot, detail: "high" },
          ],
        },
      ],
      max_output_tokens: 650,
      text: {
        format: {
          type: "json_schema",
          name: "samuel_desktop_step",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              action: {
                type: "string",
                enum: ["click", "double_click", "type", "shortcut", "scroll", "wait", "done", "fail"],
              },
              x: { type: ["integer", "null"] },
              y: { type: ["integer", "null"] },
              text: { type: ["string", "null"] },
              keys: { type: "array", items: { type: "string" }, maxItems: 6 },
              delta: { type: ["integer", "null"] },
              message: { type: "string" },
              verify: { type: "string" },
            },
            required: ["action", "x", "y", "text", "keys", "delta", "message", "verify"],
          },
        },
      },
    }),
  });

  const raw = (await response.json().catch(() => ({}))) as unknown;
  if (!response.ok) {
    const message =
      raw && typeof raw === "object" && (raw as { error?: { message?: string } }).error?.message
        ? String((raw as { error?: { message?: string } }).error?.message)
        : "O modelo de computer use não respondeu.";
    return jsonError(message, response.status >= 500 ? 502 : response.status, "COMPUTER_MODEL_FAILED");
  }

  const text = extractOutputText(raw);
  let nextAction: Record<string, unknown>;
  try {
    nextAction = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return jsonError("O modelo devolveu uma ação inválida.", 502, "COMPUTER_ACTION_INVALID");
  }

  await appendDesktopEvent(device.id, commandId, "computer_step_planned", {
    step,
    action: nextAction.action,
    message: String(nextAction.message ?? "").slice(0, 500),
    model,
  });

  return Response.json(
    { action: nextAction, model, step },
    { headers: { "Cache-Control": "no-store" } },
  );
}
