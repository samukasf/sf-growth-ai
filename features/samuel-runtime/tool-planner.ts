import type { CalendarActionId } from "@/features/google-calendar";
import type { ContactsActionId } from "@/features/google-contacts";
import type { DriveActionId, DriveOfficeFileType } from "@/features/google-drive";
import type { CalculatorOperator, GmailActionId, SupabaseQueryId } from "@/features/samuel-tool-orchestrator";

/**
 * Tool Planning (Sprint 80).
 *
 * Decide, a partir da pergunta do usuário, se uma das ferramentas do Tool
 * Orchestrator (`@/features/samuel-tool-orchestrator`) é necessária para
 * responder. Vive em `features/samuel-runtime` (não em
 * `samuel-tool-orchestrator`) porque exige entender a linguagem da
 * pergunta — algo que uma Tool nunca pode saber, por regra da Sprint 79
 * ("nenhuma Tool pode conhecer o Samuel").
 *
 * Nesta sprint suporta apenas as 4 tools mock já existentes: calculator,
 * date-time, uuid, json-formatter. Não há IA envolvida — são regras
 * determinísticas e testáveis, na mesma linha do Intent Router (Sprint 75).
 */

export type ToolPlan =
  | { selected: false }
  | { selected: true; toolName: string; input: Record<string, unknown>; reason: string };

export type ToolDetectorMatch = { input: Record<string, unknown>; reason: string };

export interface ToolDetector {
  readonly toolName: string;
  detect(query: string): ToolDetectorMatch | null;
}

const CALCULATOR_OPERATOR_MAP: Record<string, CalculatorOperator> = {
  "+": "+",
  "-": "-",
  "*": "*",
  x: "*",
  "×": "*",
  "/": "/",
  "÷": "/",
  mais: "+",
  menos: "-",
  vezes: "*",
  dividido: "/",
};

const CALCULATOR_PATTERN =
  /(-?\d+(?:[.,]\d+)?)\s*(\+|-|\*|x|×|\/|÷|mais|menos|vezes|dividido(?:\s+por)?)\s*(-?\d+(?:[.,]\d+)?)/i;

function parseCalculatorNumber(raw: string): number {
  return Number(raw.replace(",", "."));
}

export const calculatorDetector: ToolDetector = {
  toolName: "calculator",
  detect(query: string): ToolDetectorMatch | null {
    const match = query.match(CALCULATOR_PATTERN);
    if (!match) return null;

    const [expression, rawA, rawOperator, rawB] = match;
    const normalizedOperator = rawOperator.toLowerCase().replace(/\s+por$/, "");
    const operator = CALCULATOR_OPERATOR_MAP[normalizedOperator];
    if (!operator) return null;

    return {
      input: { a: parseCalculatorNumber(rawA), operator, b: parseCalculatorNumber(rawB) },
      reason: `A pergunta contém uma expressão aritmética reconhecida ("${expression.trim()}").`,
    };
  },
};

const DATE_TIME_PATTERN =
  /(que horas são|hora atual|data (de hoje|atual)|qual (a )?data|data e hora|que dia é hoje)/i;

export const dateTimeDetector: ToolDetector = {
  toolName: "date-time",
  detect(query: string): ToolDetectorMatch | null {
    if (!DATE_TIME_PATTERN.test(query)) return null;

    return {
      input: { format: "readable" },
      reason: "A pergunta pede a data e/ou hora atual.",
    };
  },
};

const UUID_PATTERN = /(gera?r?\s+um\s+uuid|crie?\s+um\s+uuid|\buuid\b|identificador\s+único)/i;

export const uuidDetector: ToolDetector = {
  toolName: "uuid",
  detect(query: string): ToolDetectorMatch | null {
    if (!UUID_PATTERN.test(query)) return null;

    return {
      input: { count: 1 },
      reason: "A pergunta pede a geração de um identificador único (UUID).",
    };
  },
};

const JSON_FORMATTER_KEYWORD_PATTERN = /(formate?|formatar|valide?|validar)\s+(esse|este|esta|o|a)?\s*json/i;

export const jsonFormatterDetector: ToolDetector = {
  toolName: "json-formatter",
  detect(query: string): ToolDetectorMatch | null {
    if (!JSON_FORMATTER_KEYWORD_PATTERN.test(query)) return null;

    const start = query.indexOf("{");
    const end = query.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    const raw = query.slice(start, end + 1);
    return {
      input: { raw },
      reason: "A pergunta pede para formatar um JSON, e um trecho JSON foi encontrado na mensagem.",
    };
  },
};

/**
 * Detecção da Supabase Query Tool (Sprint 85). Cada padrão é
 * deliberadamente específico o suficiente para não capturar perguntas de
 * negócio genéricas já cobertas pelo Company Brain/Executive Council — ex.:
 * "Analise meu faturamento." (sem "mês") continua devolvendo `selected:
 * false`, exatamente como antes desta sprint; só "faturamento/receita
 * (deste/do) mês" aciona a consulta real.
 */
const COUNT_CONTACTS_PATTERN = /quantos\s+(clientes|contatos)|n[uú]mero\s+de\s+(clientes|contatos)/i;
const INACTIVE_CONTACTS_PATTERN = /(empresas?|clientes?|contatos?)\s+(est[aã]o\s+)?inativ/i;
const REVENUE_CURRENT_MONTH_PATTERN =
  /(faturamento|receita)\s+(deste|do|neste)\s+m[eê]s|faturamento\s+m[eê]s\s+atual/i;

export const supabaseQueryDetector: ToolDetector = {
  toolName: "supabase-query",
  detect(query: string): ToolDetectorMatch | null {
    let queryId: SupabaseQueryId | null = null;
    let reason = "";

    if (COUNT_CONTACTS_PATTERN.test(query)) {
      queryId = "count_contacts";
      reason = "A pergunta pede a contagem real de clientes/contatos no CRM.";
    } else if (INACTIVE_CONTACTS_PATTERN.test(query)) {
      queryId = "list_inactive_contacts";
      reason = "A pergunta pede a lista de clientes/contatos sem interação recente.";
    } else if (REVENUE_CURRENT_MONTH_PATTERN.test(query)) {
      queryId = "revenue_current_month";
      reason = "A pergunta pede o faturamento real registrado no mês corrente.";
    }

    if (!queryId) return null;

    return { input: { queryId }, reason };
  },
};

/**
 * Detecção da Gmail Tool (Sprint 87). Cada ação usa whitelist fixa de
 * `actionId` — a Tool executa Gmail real via `integrations/gmail`.
 */
const GMAIL_REPLY_PATTERN =
  /(?:responda?|responder)\s+(?:(?:ao|os|meus|o)\s+)?(?:e-?mails?|mensagens?)(?:\s+(?:com\s*:?|dizendo|:)\s*(.+))?[.!?]*$/i;
const GMAIL_SEARCH_PATTERN =
  /(?:busque?|pesquise?|procure?|encontre?)\s+(?:e-?mails?|mensagens?)(?:\s+(?:de|sobre|com|para)\s+(.+?))?[.!?]*$/i;
const GMAIL_READ_PATTERN = /(ler|leia|abrir)\s+(?:o\s+)?(?:e-?mail|mensagem)/i;
const GMAIL_INBOX_PATTERN =
  /(resumo|resumir|listar|mostrar|ver|quantos).*(e-?mails?|inbox|caixa de entrada)|meus e-?mails?|caixa de entrada|e-?mails? não lidos|últimos e-?mails?/i;

export const gmailDetector: ToolDetector = {
  toolName: "gmail",
  detect(query: string): ToolDetectorMatch | null {
    const replyMatch = query.match(GMAIL_REPLY_PATTERN);
    if (replyMatch) {
      const body = replyMatch[1]?.trim();
      if (body) {
        return {
          input: { actionId: "reply_message" satisfies GmailActionId, body },
          reason: "A pergunta pede para responder um e-mail com texto específico.",
        };
      }
      return {
        input: { actionId: "inbox_summary" satisfies GmailActionId },
        reason: "A pergunta pede ação sobre e-mails — recuperando inbox para análise pela IA.",
      };
    }

    const searchMatch = query.match(GMAIL_SEARCH_PATTERN);
    if (searchMatch) {
      const term = searchMatch[1]?.trim();
      const gmailQuery = term ? `in:inbox ${term}` : "in:inbox";
      return {
        input: { actionId: "search_messages" satisfies GmailActionId, query: gmailQuery },
        reason: term
          ? `A pergunta pede busca de e-mails sobre "${term}".`
          : "A pergunta pede busca de e-mails na inbox.",
      };
    }

    if (GMAIL_READ_PATTERN.test(query)) {
      return {
        input: { actionId: "read_message" satisfies GmailActionId },
        reason: "A pergunta pede leitura de um e-mail.",
      };
    }

    if (GMAIL_INBOX_PATTERN.test(query)) {
      return {
        input: { actionId: "inbox_summary" satisfies GmailActionId },
        reason: "A pergunta pede resumo ou listagem da caixa de entrada.",
      };
    }

    return null;
  },
};

function defaultCreateSchedule(query: string): { title: string; start: string; end: string } {
  const titleMatch = query.match(/(?:reuni[aã]o|compromisso|evento)\s+(?:de\s+|com\s+)?(.+?)(?:\s+para|\s+às|[.!?]|$)/i);
  const title = titleMatch?.[1]?.trim() || "Reunião";

  const start = new Date();
  if (/sexta/i.test(query)) {
    const day = start.getDay();
    const daysUntilFriday = ((5 - day + 7) % 7) || 7;
    start.setDate(start.getDate() + daysUntilFriday);
    start.setHours(10, 0, 0, 0);
  } else if (/amanh[aã]/i.test(query)) {
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
  } else {
    start.setHours(start.getHours() + 1, 0, 0, 0);
  }

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return { title, start: start.toISOString(), end: end.toISOString() };
}

const CALENDAR_DELETE_PATTERN =
  /(?:cancel(e|ar)|exclu(a|ir)|apague?|remova?)\s+(?:o\s+)?(?:evento|reuni[aã]o|compromisso)/i;
const CALENDAR_UPDATE_PATTERN =
  /(?:atualize|altere|mude|reagende)\s+(?:o\s+)?(?:evento|reuni[aã]o|compromisso)/i;
const CALENDAR_CREATE_PATTERN =
  /(?:marque|agende|crie?|criar)\s+(?:um[a]?\s+)?(?:evento|reuni[aã]o|compromisso)|agende\s+para/i;
const CALENDAR_AVAILABILITY_PATTERN =
  /hor[aá]rio livre|tenho (algum )?hor[aá]rio|disponibilidade|estou livre|tenho tempo/i;
const CALENDAR_SEARCH_PATTERN =
  /(?:procure?|pesquise?|busque?|encontre?)\s+(?:eventos?|reuni[oõ]es?|compromissos?)/i;
const CALENDAR_WEEK_PATTERN = /agenda da semana|essa semana|nesta semana|compromissos? da semana/i;
const CALENDAR_TOMORROW_PATTERN = /reuni[aã]o amanh[aã]|tenho.*amanh[aã]|compromissos? de amanh[aã]/i;
const CALENDAR_NEXT_PATTERN = /pr[oó]ximo compromisso|pr[oó]xima reuni[aã]o|quando [eé] meu pr[oó]ximo/i;
const CALENDAR_TODAY_PATTERN =
  /o que tenho hoje|minha agenda|compromissos? de hoje|agenda de hoje|o que tenho agora|meus compromissos?/i;

export const googleCalendarDetector: ToolDetector = {
  toolName: "google-calendar",
  detect(query: string): ToolDetectorMatch | null {
    if (CALENDAR_DELETE_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_delete" satisfies CalendarActionId },
        reason: "A pergunta pede exclusão de um evento no calendário.",
      };
    }

    if (CALENDAR_UPDATE_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_update" satisfies CalendarActionId },
        reason: "A pergunta pede atualização de um evento no calendário.",
      };
    }

    if (CALENDAR_CREATE_PATTERN.test(query)) {
      const schedule = defaultCreateSchedule(query);
      return {
        input: {
          actionId: "calendar_create" satisfies CalendarActionId,
          title: schedule.title,
          start: schedule.start,
          end: schedule.end,
        },
        reason: "A pergunta pede criação ou agendamento de um evento.",
      };
    }

    if (CALENDAR_AVAILABILITY_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_availability" satisfies CalendarActionId },
        reason: "A pergunta pede verificação de disponibilidade na agenda.",
      };
    }

    if (CALENDAR_SEARCH_PATTERN.test(query)) {
      const termMatch = query.match(/(?:de|sobre|com)\s+(.+?)[.!?]*$/i);
      return {
        input: {
          actionId: "calendar_search" satisfies CalendarActionId,
          query: termMatch?.[1]?.trim() || query,
        },
        reason: "A pergunta pede busca de eventos no calendário.",
      };
    }

    if (CALENDAR_TOMORROW_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_today" satisfies CalendarActionId, dayOffset: 1 },
        reason: "A pergunta pede compromissos de amanhã.",
      };
    }

    if (CALENDAR_WEEK_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_week" satisfies CalendarActionId },
        reason: "A pergunta pede a agenda da semana.",
      };
    }

    if (CALENDAR_NEXT_PATTERN.test(query) || CALENDAR_TODAY_PATTERN.test(query)) {
      return {
        input: { actionId: "calendar_today" satisfies CalendarActionId },
        reason: "A pergunta pede compromissos de hoje ou o próximo compromisso.",
      };
    }

    return null;
  },
};

const CONTACTS_BIRTHDAYS_PATTERN =
  /(?:quais\s+)?contatos?\s+(?:fazem?\s+)?anivers[aá]rio\s+(?:este|neste)\s+m[eê]s/i;
const CONTACTS_COMPANY_PATTERN =
  /quem\s+trabalha\s+(?:na|no|em)\s+(?:empresa\s+)?(.+?)[.!?]*$/i;
const CONTACTS_PHONE_PATTERN =
  /(?:qual\s+(?:é|e)\s+)?(?:o\s+)?telefone\s+(?:do|da|de)\s+(.+?)[.!?]*$/i;
const CONTACTS_EMAIL_PATTERN =
  /(?:qual\s+(?:é|e)\s+)?(?:o\s+)?e-?mail\s+(?:do|da|de)\s+(.+?)[.!?]*$/i;
const CONTACTS_SEARCH_PATTERN =
  /(?:procure?|pesquise?|busque?|encontre?)\s+(?:o\s+)?contato\s+(?:da|do|de)\s+(.+?)[.!?]*$/i;

export const googleContactsDetector: ToolDetector = {
  toolName: "google-contacts",
  detect(query: string): ToolDetectorMatch | null {
    if (CONTACTS_BIRTHDAYS_PATTERN.test(query)) {
      return {
        input: { actionId: "contacts_birthdays" satisfies ContactsActionId },
        reason: "A pergunta pede contatos com aniversário neste mês.",
      };
    }

    const companyMatch = query.match(CONTACTS_COMPANY_PATTERN);
    if (companyMatch) {
      const company = companyMatch[1]?.trim();
      if (company) {
        return {
          input: { actionId: "contacts_company" satisfies ContactsActionId, company },
          reason: `A pergunta pede contatos que trabalham em "${company}".`,
        };
      }
    }

    const phoneMatch = query.match(CONTACTS_PHONE_PATTERN);
    if (phoneMatch) {
      const name = phoneMatch[1]?.trim();
      if (name) {
        return {
          input: { actionId: "contacts_phone" satisfies ContactsActionId, name },
          reason: `A pergunta pede o telefone de "${name}".`,
        };
      }
    }

    const emailMatch = query.match(CONTACTS_EMAIL_PATTERN);
    if (emailMatch) {
      const name = emailMatch[1]?.trim();
      if (name) {
        return {
          input: { actionId: "contacts_email" satisfies ContactsActionId, name },
          reason: `A pergunta pede o e-mail de "${name}".`,
        };
      }
    }

    const searchMatch = query.match(CONTACTS_SEARCH_PATTERN);
    if (searchMatch) {
      const term = searchMatch[1]?.trim();
      if (term) {
        return {
          input: { actionId: "contacts_search" satisfies ContactsActionId, query: term, name: term },
          reason: `A pergunta pede busca do contato "${term}".`,
        };
      }
    }

    return null;
  },
};

const DRIVE_RECENT_PATTERN =
  /(?:arquivos?\s+recentes?|últimos?\s+arquivos?|modificados?\s+recentemente).*(?:drive|google\s+drive)|(?:drive|google\s+drive).*(?:arquivos?\s+recentes?|últimos?\s+arquivos?)/i;
const DRIVE_SEARCH_PATTERN =
  /(?:busque?|pesquise?|procure?|encontre?).*(?:no\s+)?(?:google\s+)?drive|(?:no\s+)?(?:google\s+)?drive.*(?:busque?|pesquise?|procure?)/i;
const DRIVE_READ_DOC_PATTERN =
  /(?:leia?|abra?|conteúdo\s+do?|o\s+que\s+diz).*(?:documento|google\s+doc|doc)/i;
const DRIVE_FIND_OFFICE_PATTERN =
  /(?:onde\s+est[aá]|localize?|encontre?|ache?).*(?:pdf|excel|planilha|powerpoint|pptx|docx|word|arquivo)/i;
const DRIVE_DOWNLOAD_PATTERN =
  /(?:baixe?|extraia?|leia?).*(?:arquivo|pdf|excel|planilha|powerpoint|docx)/i;

function parseDriveFileType(query: string): DriveOfficeFileType | undefined {
  if (/\bpdf\b/i.test(query)) return "pdf";
  if (/\b(?:xlsx|excel|planilha)\b/i.test(query)) return "xlsx";
  if (/\b(?:pptx|powerpoint|apresenta[cç][aã]o)\b/i.test(query)) return "pptx";
  if (/\b(?:docx|word)\b/i.test(query)) return "docx";
  return undefined;
}

function parseDriveFileName(query: string): string | undefined {
  const patterns = [
    /(?:documento|arquivo|doc|planilha|pdf)\s+(?:do|da|de\s+)?["']?([^"'.!?]+?)["']?(?:\s+no\s+(?:google\s+)?drive)?[.!?]*$/i,
    /(?:chamad[oa]|nome)\s+["']?([^"'.!?]+?)["']?(?:\s+no\s+(?:google\s+)?drive)?/i,
    /(?:de|do|da)\s+["']?([^"'.!?]+?)["']?(?:\s+no\s+(?:google\s+)?drive)?[.!?]*$/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    const name = match?.[1]?.trim();
    if (name && name.length > 1) {
      return name.replace(/\s+no\s+(?:google\s+)?drive$/i, "").trim();
    }
  }

  const searchMatch = query.match(/(?:para|por)\s+["']?([^"'.!?]+)["']?/i);
  return searchMatch?.[1]?.trim();
}

function parseDriveSearchTerm(query: string): string {
  const termMatch = query.match(/(?:por|para|sobre|com)\s+["']?([^"'.!?]+)["']?/i);
  return termMatch?.[1]?.trim() || query.trim();
}

export const googleDriveDetector: ToolDetector = {
  toolName: "google-drive",
  detect(query: string): ToolDetectorMatch | null {
    if (DRIVE_RECENT_PATTERN.test(query)) {
      return {
        input: { actionId: "drive_recent" satisfies DriveActionId },
        reason: "A pergunta pede arquivos recentes do Google Drive.",
      };
    }

    if (DRIVE_READ_DOC_PATTERN.test(query)) {
      const name = parseDriveFileName(query);
      return {
        input: {
          actionId: "drive_read_doc" satisfies DriveActionId,
          ...(name ? { name } : {}),
        },
        reason: name
          ? `A pergunta pede leitura do Google Doc "${name}".`
          : "A pergunta pede leitura de um Google Doc.",
      };
    }

    if (DRIVE_FIND_OFFICE_PATTERN.test(query)) {
      const name = parseDriveFileName(query);
      const fileType = parseDriveFileType(query);
      if (name) {
        return {
          input: {
            actionId: "drive_find_office" satisfies DriveActionId,
            name,
            ...(fileType ? { fileType } : {}),
          },
          reason: `A pergunta pede localizar o arquivo "${name}" no Drive.`,
        };
      }
    }

    if (DRIVE_DOWNLOAD_PATTERN.test(query)) {
      const name = parseDriveFileName(query);
      const fileType = parseDriveFileType(query);
      if (name) {
        return {
          input: {
            actionId: "drive_download" satisfies DriveActionId,
            name,
            ...(fileType ? { fileType } : {}),
          },
          reason: `A pergunta pede extrair conteúdo do arquivo "${name}".`,
        };
      }
    }

    if (DRIVE_SEARCH_PATTERN.test(query)) {
      const queryTerm = parseDriveSearchTerm(query);
      return {
        input: {
          actionId: "drive_search" satisfies DriveActionId,
          query: queryTerm,
        },
        reason: `A pergunta pede busca no Google Drive por "${queryTerm}".`,
      };
    }

    return null;
  },
};

/** Ordem de prioridade quando mais de um padrão poderia bater. */
export const DEFAULT_TOOL_DETECTORS: ReadonlyArray<ToolDetector> = [
  calculatorDetector,
  dateTimeDetector,
  uuidDetector,
  jsonFormatterDetector,
  supabaseQueryDetector,
  gmailDetector,
  googleCalendarDetector,
  googleContactsDetector,
  googleDriveDetector,
];

export class ToolPlanner {
  private readonly detectors: ReadonlyArray<ToolDetector>;

  constructor(detectors: ReadonlyArray<ToolDetector> = DEFAULT_TOOL_DETECTORS) {
    this.detectors = Object.freeze([...detectors]);
  }

  plan(query: string): ToolPlan {
    for (const detector of this.detectors) {
      const match = detector.detect(query);
      if (match) {
        return { selected: true, toolName: detector.toolName, input: match.input, reason: match.reason };
      }
    }

    return { selected: false };
  }
}

export function createToolPlanner(detectors?: ReadonlyArray<ToolDetector>): ToolPlanner {
  return new ToolPlanner(detectors);
}
