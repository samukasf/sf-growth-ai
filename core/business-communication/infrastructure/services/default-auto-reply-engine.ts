import type {
  ApprovalWorkflow,
  AutoReplyEngine,
  AutoReplyPolicy,
  AutoReplySuggestion,
  AutonomyLevel,
  Message,
} from "../../domain";

const SIMPLE_TEMPLATES: Record<string, string> = {
  horário: "Nosso horário de funcionamento é de segunda a sexta, das 9h às 18h.",
  preço: "Para informações sobre preços, um consultor entrará em contato em breve.",
  onde: "Você pode nos encontrar no endereço cadastrado em nosso perfil.",
};

export class DefaultAutoReplyEngine implements AutoReplyEngine {
  suggest(message: Message, policies: AutoReplyPolicy[]) {
    const active = policies.filter((p) => p.active);
    if (active.length === 0) return null;

    const policy = active[0]!;
    const content = message.content.toLowerCase();

    let suggestedReply = "Obrigado pela sua mensagem. Em breve retornaremos o contato.";
    for (const [keyword, template] of Object.entries(SIMPLE_TEMPLATES)) {
      if (content.includes(keyword)) {
        suggestedReply = template;
        break;
      }
    }

    return {
      suggestedReply,
      autonomyLevel: policy.autonomyLevel,
      requiresApproval: policy.requiresApproval || policy.autonomyLevel === 1,
      policyId: policy.id,
    };
  }

  canAutoExecute(autonomyLevel: AutonomyLevel, classification: string): boolean {
    if (autonomyLevel === 1) return false;
    if (autonomyLevel === 2) return classification === "simple_question";
    if (autonomyLevel === 3) return true;
    return autonomyLevel === 4;
  }
}

export class DefaultApprovalWorkflow implements ApprovalWorkflow {
  requiresApproval(autonomyLevel: AutonomyLevel, policy: AutoReplyPolicy): boolean {
    if (autonomyLevel === 1) return true;
    if (autonomyLevel === 4) return false;
    return policy.requiresApproval;
  }

  approve(suggestion: AutoReplySuggestion, approverId: string) {
    void approverId;
    return { ...suggestion, requiresApproval: false };
  }
}
