import type { CalculatorOperator } from "@/features/samuel-tool-orchestrator";

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

/** Ordem de prioridade quando mais de um padrão poderia bater. */
export const DEFAULT_TOOL_DETECTORS: ReadonlyArray<ToolDetector> = [
  calculatorDetector,
  dateTimeDetector,
  uuidDetector,
  jsonFormatterDetector,
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
