import type { DesktopAction, DesktopRisk } from "@/features/samuel-desktop/server/desktop-agent.server";

export type DirectDesktopCommand = {
  action: DesktopAction;
  args: Record<string, unknown>;
  risk: DesktopRisk;
};

const OPEN_VERB = /\b(abra|abrir|inicie|iniciar|execute|executar)\b/i;

const FOLDERS: Array<{ pattern: RegExp; shellTarget: string }> = [
  {
    pattern: /\b(downloads?|transfer[eê]ncias)\b/i,
    shellTarget: "shell:Downloads",
  },
  {
    pattern: /\b(documentos?|meus documentos|documents?)\b/i,
    shellTarget: "shell:Personal",
  },
  {
    pattern: /\b([aá]rea de trabalho|desktop)\b/i,
    shellTarget: "shell:Desktop",
  },
  {
    pattern: /\b(imagens?|fotos?|pictures?)\b/i,
    shellTarget: "shell:PicturesLibrary",
  },
  {
    pattern: /\b(v[ií]deos?|videos?)\b/i,
    shellTarget: "shell:VideosLibrary",
  },
  {
    pattern: /\b(m[uú]sicas?|music)\b/i,
    shellTarget: "shell:MusicLibrary",
  },
  {
    pattern: /\b(este computador|meu computador|this pc)\b/i,
    shellTarget: "shell:MyComputerFolder",
  },
];

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
  const folder = FOLDERS.find(({ pattern }) => pattern.test(goal));

  // If a real application is explicitly named, prefer it over incidental
  // phrases such as "no meu computador". Explorer is the exception: when a
  // well-known folder is present, open that folder directly in Explorer.
  if (application && application.file !== "explorer.exe") {
    return {
      action: "system.app.open",
      args: { file: application.file },
      risk: "mutate",
    };
  }

  if (folder) {
    return {
      action: "system.app.open",
      args: { file: "explorer.exe", args: [folder.shellTarget] },
      risk: "mutate",
    };
  }

  if (!application) return null;
  return {
    action: "system.app.open",
    args: { file: application.file },
    risk: "mutate",
  };
}
