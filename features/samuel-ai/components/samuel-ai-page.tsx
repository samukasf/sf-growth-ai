import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
};

export function SamuelAiPage({
  executiveContext = null,
  executiveIntelligence = null,
}: SamuelAiPageProps) {
  return (
    <SamuelAiShell
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
    />
  );
}
