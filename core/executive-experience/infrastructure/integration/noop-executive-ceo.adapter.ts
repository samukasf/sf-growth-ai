import type { ExecutiveCEOPort, ExecutiveCEOExperienceBriefing } from "../../application";

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  async notifyExperienceInsight(briefing: ExecutiveCEOExperienceBriefing): Promise<void> {
    void briefing;
  }
}
