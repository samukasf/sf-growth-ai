import type { CompanyMemoryRecord } from "@/services/executive-memory.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  companyMemories?: CompanyMemoryRecord[];
};

export function SamuelAiPage({ companyMemories = [] }: SamuelAiPageProps) {
  return <SamuelAiShell companyMemories={companyMemories} />;
}
