import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
};

export function SamuelAiPage({
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
}: SamuelAiPageProps) {
  return (
    <SamuelAiShell
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
    />
  );
}
