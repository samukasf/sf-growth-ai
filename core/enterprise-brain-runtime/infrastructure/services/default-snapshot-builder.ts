import { EnterpriseBrainSnapshot } from "../../domain";
import type {
  EnterpriseBrainSnapshotBuilder,
  SnapshotBuildInput,
} from "../../domain/ports/snapshot-builder.port";

export class DefaultEnterpriseBrainSnapshotBuilder implements EnterpriseBrainSnapshotBuilder {
  build(input: SnapshotBuildInput) {
    return EnterpriseBrainSnapshot.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      businessContext: input.businessContext,
      memorySummary: input.memorySummary,
      knowledgeSummary: input.knowledgeSummary,
      learningSummary: input.learningSummary,
      experienceSummary: input.experienceSummary,
      wisdomSummary: input.wisdomSummary,
      organizationSummary: input.organizationSummary,
      activeSignals: input.activeSignals.map((signal) => signal.toJSON()),
      risks: input.risks,
      opportunities: input.opportunities,
      priorities: input.priorities,
      confidence: input.confidence,
    });
  }
}
