import { LearningPattern, type LearningRecord, type PatternDetector } from "../../domain";

export class DefaultPatternDetector implements PatternDetector {
  detect(records: LearningRecord[]): LearningPattern[] {
    if (records.length < 2) return [];

    const patterns: LearningPattern[] = [];
    const successRecords = records.filter((record) => record.successLevel >= 70);
    const failureRecords = records.filter((record) => record.successLevel < 40);

    if (successRecords.length >= 2) {
      patterns.push(
        LearningPattern.create({
          companyId: records[0].companyId,
          type: "recurring_success",
          title: "Recurring successful outcomes",
          description: `${successRecords.length} learning records with high success level`,
          relatedRecordIds: successRecords.map((record) => record.id),
          frequency: successRecords.length,
          confidence: Math.min(100, successRecords.length * 15),
        }),
      );
    }

    if (failureRecords.length >= 2) {
      patterns.push(
        LearningPattern.create({
          companyId: records[0].companyId,
          type: "recurring_failure",
          title: "Recurring low-success outcomes",
          description: `${failureRecords.length} learning records with low success level`,
          relatedRecordIds: failureRecords.map((record) => record.id),
          frequency: failureRecords.length,
          confidence: Math.min(100, failureRecords.length * 15),
        }),
      );
    }

    const byDecision = groupBy(records, (record) => record.decisionId ?? "none");
    for (const [decisionId, grouped] of Object.entries(byDecision)) {
      if (decisionId === "none" || grouped.length < 2) continue;

      patterns.push(
        LearningPattern.create({
          companyId: grouped[0].companyId,
          type: "operational",
          title: `Repeated learning around decision ${decisionId}`,
          description: `${grouped.length} records linked to the same decision`,
          relatedRecordIds: grouped.map((record) => record.id),
          frequency: grouped.length,
          confidence: Math.min(100, grouped.length * 12),
        }),
      );
    }

    return patterns;
  }
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = keyFn(item);
    accumulator[key] = accumulator[key] ?? [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
}
