import type { ExecutiveCEOPort, ExecutiveCEOWisdomBriefing } from "../../application";
import type { ExecutiveWisdom } from "../../domain";

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  async notifyWisdomInsight(briefing: ExecutiveCEOWisdomBriefing): Promise<void> {
    void briefing;
  }

  async summarizeWisdomImpact(items: ExecutiveWisdom[]): Promise<string[]> {
    return items.map((item) => item.recommendation).slice(0, 3);
  }
}
