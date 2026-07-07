import type { AutonomyLevel, AutoReplyPolicy, Message } from "../entities";

export type AutoReplySuggestion = {
  suggestedReply: string;
  autonomyLevel: AutonomyLevel;
  requiresApproval: boolean;
  policyId?: string;
};

export interface AutoReplyEngine {
  suggest(message: Message, policies: AutoReplyPolicy[]): AutoReplySuggestion | null;
  canAutoExecute(autonomyLevel: AutonomyLevel, classification: string): boolean;
}

export interface ApprovalWorkflow {
  requiresApproval(autonomyLevel: AutonomyLevel, policy: AutoReplyPolicy): boolean;
  approve(suggestion: AutoReplySuggestion, approverId: string): AutoReplySuggestion;
}
