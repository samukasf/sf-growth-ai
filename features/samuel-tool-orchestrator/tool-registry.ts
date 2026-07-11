/**
 * Registry imutável de Tools (Sprint 79) — mesma regra de design já
 * obrigatória para o Samuel Intent Router (Sprint 75): a lista de Tools é
 * recebida uma única vez e nunca modificada depois. Isso garante:
 *   - testes não se contaminam entre si (cada teste cria seu próprio registry);
 *   - impossível "registrar" a mesma Tool duas vezes em tempo de execução;
 *   - chamadas concorrentes usando o mesmo registry sempre veem exatamente
 *     as mesmas Tools — nenhuma mutação em voo.
 */
import type { Tool, ToolRegistry } from "./types";

export class ImmutableToolRegistry implements ToolRegistry {
  readonly tools: ReadonlyArray<Tool>;
  private readonly byName: ReadonlyMap<string, Tool>;

  constructor(tools: ReadonlyArray<Tool>) {
    const byName = new Map<string, Tool>();

    for (const tool of tools) {
      if (byName.has(tool.name)) {
        throw new Error(
          `[samuel-tool-orchestrator] Nome de Tool duplicado no registry: "${tool.name}".`,
        );
      }
      byName.set(tool.name, tool);
    }

    this.tools = Object.freeze([...tools]);
    this.byName = byName;
  }

  get(name: string): Tool | undefined {
    return this.byName.get(name);
  }

  has(name: string): boolean {
    return this.byName.has(name);
  }

  list(): ReadonlyArray<{ name: string; description: string }> {
    return this.tools.map((tool) => ({ name: tool.name, description: tool.description }));
  }
}

/** Factory pública — cada chamada produz um registry novo e independente. */
export function createToolRegistry(tools: ReadonlyArray<Tool>): ToolRegistry {
  return new ImmutableToolRegistry(tools);
}
