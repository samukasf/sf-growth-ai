import { EnterpriseBrainSignal } from "../../domain";
import type { EnterpriseBrainSignalProcessor } from "../../domain/ports/signal-processor.port";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";

export class DefaultEnterpriseBrainSignalProcessor implements EnterpriseBrainSignalProcessor {
  process(contributions: DataSourceContribution[]) {
    const signals: EnterpriseBrainSignal[] = [];

    for (const contribution of contributions) {
      if (!contribution.available) {
        signals.push(
          EnterpriseBrainSignal.create({
            type: "alert",
            title: `${contribution.source} unavailable`,
            description: `Data source ${contribution.source} is not available`,
            source: contribution.source,
            severity: 80,
          }),
        );
        continue;
      }

      if (contribution.recordCount > 0) {
        signals.push(
          EnterpriseBrainSignal.create({
            type: "insight",
            title: `${contribution.source} active`,
            description: contribution.summary,
            source: contribution.source,
            severity: 40,
          }),
        );
      }

      if (contribution.healthScore < 50) {
        signals.push(
          EnterpriseBrainSignal.create({
            type: "risk",
            title: `Low health: ${contribution.source}`,
            description: `Health score ${contribution.healthScore} for ${contribution.source}`,
            source: contribution.source,
            severity: 70,
          }),
        );
      }

      if (contribution.recordCount > 10) {
        signals.push(
          EnterpriseBrainSignal.create({
            type: "opportunity",
            title: `Growth in ${contribution.source}`,
            description: `${contribution.recordCount} records available`,
            source: contribution.source,
            severity: 55,
          }),
        );
      }
    }

    return signals;
  }

  extractRisks(signals: EnterpriseBrainSignal[]) {
    return signals.filter((s) => s.type === "risk" || s.type === "alert").map((s) => s.title);
  }

  extractOpportunities(signals: EnterpriseBrainSignal[]) {
    return signals.filter((s) => s.type === "opportunity").map((s) => s.title);
  }

  extractPriorities(signals: EnterpriseBrainSignal[]) {
    return signals
      .filter((s) => s.type === "priority" || s.type === "risk")
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((s) => s.title);
  }
}
