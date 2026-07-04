import type { ExecutiveContext } from "@/services/executive-context.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
};

export function SamuelAiPage({ executiveContext = null }: SamuelAiPageProps) {
  return <SamuelAiShell executiveContext={executiveContext} />;
}
