import type { GoogleWorkspaceSummary } from "./google-workspace.types";

export type GoogleWorkspaceChatSignal = {
  relevant: boolean;
  fragments: string[];
  fallbackAnswer: string | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function serviceLabel(
  label: string,
  status: GoogleWorkspaceSummary["gmail"],
  connectedText: (count: number | null) => string,
) {
  if (status.connected) return `${label}: ${connectedText(status.count)}`;
  if (status.error) return `${label}: precisa de reautorização ou atenção`;
  return `${label}: não conectado`;
}

export function createGoogleWorkspaceChatSignal(
  query: string,
  summary: GoogleWorkspaceSummary | null,
): GoogleWorkspaceChatSignal {
  const normalized = normalize(query);
  const asksGmail = /\b(gmail|e-?mails?|inbox|correio|mensagens?)\b/.test(normalized);
  const asksCalendar = /\b(agenda|calendar|calendario|reuniao|reunioes|compromisso|evento)\b/.test(normalized);
  const asksDrive = /\b(drive|arquivo|arquivos|documento|documentos|pasta|pastas)\b/.test(normalized);
  const asksContacts = /\b(contato|contatos|contact|contacts)\b/.test(normalized);
  const asksWorkspace = /google workspace|integracoes? google/.test(normalized);
  const relevant = asksGmail || asksCalendar || asksDrive || asksContacts || asksWorkspace;

  if (!relevant) return { relevant: false, fragments: [], fallbackAnswer: null };

  if (!summary) {
    return {
      relevant: true,
      fragments: ["[GOOGLE WORKSPACE] Estado ao vivo indisponível nesta consulta."],
      fallbackAnswer:
        "Não consegui consultar o Google Workspace agora. Nenhuma ação foi executada; pode tentar novamente pelo cartão Integrações ativas.",
    };
  }

  const lines = [
    ...(asksGmail || asksWorkspace
      ? [serviceLabel("Gmail", summary.gmail, (count) => `${count ?? 0} e-mail(s) não lido(s)`)]
      : []),
    ...(asksCalendar || asksWorkspace
      ? [serviceLabel("Google Agenda", summary.calendar, (count) => `${count ?? 0} compromisso(s) hoje`)]
      : []),
    ...(asksDrive || asksWorkspace
      ? [serviceLabel("Google Drive", summary.drive, (count) => `${count ?? 0} arquivo(s) recente(s) sincronizado(s)`)]
      : []),
    ...(asksContacts || asksWorkspace
      ? [serviceLabel("Google Contatos", summary.contacts, () => "conectado")]
      : []),
  ];

  const asksToAct = /\b(envi|respond|apag|exclu|cri|marc|agend|mov|edit)/.test(normalized);
  const safety = asksToAct
    ? " Posso consultar o estado, mas nenhuma ação externa foi executada sem confirmação explícita."
    : "";

  return {
    relevant: true,
    fragments: lines.map((line) => `[GOOGLE WORKSPACE — DADO AO VIVO] ${line}`),
    fallbackAnswer: `${lines.join("\n")}.${safety}`,
  };
}
