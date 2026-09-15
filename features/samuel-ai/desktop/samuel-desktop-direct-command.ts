import type { DesktopAction, DesktopRisk } from "@/features/samuel-desktop/server/desktop-agent.server";

export type DirectDesktopCommand = {
  action: DesktopAction;
  args: Record<string, unknown>;
  risk: DesktopRisk;
};

const OPEN_VERB = /\b(abra|abrir|inicie|iniciar|execute|executar)\b/i;

const APPLICATIONS: Array<{ pattern: RegExp; file: string }> = [
  { pattern: /\b(calculadora|calculator|calc)\b/i, file: "calc.exe" },
  { pattern: /\b(bloco de notas|notepad)\b/i, file: "notepad.exe" },
  { pattern: /\b(explorador de arquivos|explorador|file explorer)\b/i, file: "explorer.exe" },
  { pattern: /\b(google chrome|chrome)\b/i, file: "chrome.exe" },
  { pattern: /\b(microsoft edge|edge)\b/i, file: "msedge.exe" },
  { pattern: /\b(microsoft word|word)\b/i, file: "winword.exe" },
  { pattern: /\b(microsoft excel|excel)\b/i, file: "excel.exe" },
  { pattern: /\b(powerpoint|power point)\b/i, file: "powerpnt.exe" },
];

export function resolveDirectDesktopCommand(goal: string): DirectDesktopCommand | null {
  if (!OPEN_VERB.test(goal)) return null;
  const application = APPLICATIONS.find(({ pattern }) => pattern.test(goal));
  if (!application) return null;
  return {
    action: "system.app.open",
    args: { file: application.file },
    risk: "mutate",
  };
}
