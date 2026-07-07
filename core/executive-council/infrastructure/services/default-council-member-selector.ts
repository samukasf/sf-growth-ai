import type { CouncilMemberSelector, CouncilRoutingContext } from "../../domain/ports/council-member-selector.port";
import type { CouncilSpecialistRole } from "../../shared";

const ROLE_KEYWORDS: Record<CouncilSpecialistRole, string[]> = {
  ceo: ["estratégia", "decisão", "direção"],
  finance: ["faturamento", "receita", "custo", "financeiro", "roi"],
  marketing: ["marketing", "marca", "aquisição", "campanha"],
  sales: ["vendas", "conversão", "pipeline"],
  operations: ["operação", "processo", "eficiência"],
  hr: ["pessoas", "equipe", "contratação", "rh"],
  legal: ["legal", "compliance", "contrato"],
  crm: ["cliente", "crm", "relacionamento"],
  communication: ["comunicação", "mensagem", "canal"],
  commerce: ["comércio", "ecommerce", "pedido"],
  scheduling: ["agenda", "agendamento", "horário"],
  innovation: ["inovação", "tecnologia", "digital"],
  projects: ["projeto", "entrega", "milestone"],
};

export class DefaultCouncilMemberSelector implements CouncilMemberSelector {
  select(context: CouncilRoutingContext): CouncilSpecialistRole[] {
    const selected = new Set<CouncilSpecialistRole>(context.suggestedRoles ?? ["ceo"]);
    const text = `${context.query} ${context.priorities.join(" ")} ${context.risks.join(" ")} ${context.opportunities.join(" ")}`.toLowerCase();

    for (const [role, keywords] of Object.entries(ROLE_KEYWORDS) as [CouncilSpecialistRole, string[]][]) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        selected.add(role);
      }
    }

    if (context.risks.length > 0) {
      selected.add("finance");
      selected.add("operations");
    }

    if (context.opportunities.length > 0) {
      selected.add("innovation");
      selected.add("sales");
    }

    if (!selected.has("ceo")) selected.add("ceo");

    return [...selected];
  }
}
