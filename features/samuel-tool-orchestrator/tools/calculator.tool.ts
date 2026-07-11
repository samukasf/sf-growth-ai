/**
 * Calculator Tool (MOCK, Sprint 79) — aritmética básica, sem nenhuma
 * dependência externa. Não conhece o Samuel nem qualquer outro módulo do
 * repositório — recebe apenas `ToolExecutionContext`.
 */
import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type CalculatorOperator = "+" | "-" | "*" | "/";

export type CalculatorToolInput = {
  a: number;
  operator: CalculatorOperator;
  b: number;
};

export type CalculatorToolOutput = {
  result: number;
};

const OPERATORS: ReadonlyArray<CalculatorOperator> = ["+", "-", "*", "/"];

export class CalculatorTool implements Tool<CalculatorToolInput, CalculatorToolOutput> {
  readonly name = "calculator";
  readonly description = "Executa uma operação aritmética básica (+, -, *, /) entre dois números.";
  readonly inputSchema = {
    a: "number — primeiro operando",
    operator: "'+' | '-' | '*' | '/'",
    b: "number — segundo operando",
  };

  async execute(
    context: ToolExecutionContext<CalculatorToolInput>,
  ): Promise<CalculatorToolOutput> {
    const { a, operator, b } = context.input;

    if (typeof a !== "number" || typeof b !== "number" || Number.isNaN(a) || Number.isNaN(b)) {
      throw new ToolExecutionError(this.name, "Os parâmetros 'a' e 'b' devem ser números válidos.");
    }

    if (!OPERATORS.includes(operator)) {
      throw new ToolExecutionError(
        this.name,
        `Operador inválido: "${operator}". Use um de: ${OPERATORS.join(", ")}.`,
      );
    }

    if (operator === "/" && b === 0) {
      throw new ToolExecutionError(this.name, "Divisão por zero não é permitida.");
    }

    switch (operator) {
      case "+":
        return { result: a + b };
      case "-":
        return { result: a - b };
      case "*":
        return { result: a * b };
      case "/":
        return { result: a / b };
    }
  }
}
