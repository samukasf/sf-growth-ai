import { ExecutivePlaybook, type ExecutiveWisdom, type PlaybookGenerator } from "../../domain";

export class DefaultPlaybookGenerator implements PlaybookGenerator {
  generate(wisdom: ExecutiveWisdom): ExecutivePlaybook {
    return ExecutivePlaybook.create({
      companyId: wisdom.companyId,
      wisdomId: wisdom.id,
      title: `Playbook: ${wisdom.recommendation.slice(0, 60)}`,
      description: wisdom.reasoning || wisdom.expectedOutcome,
      domain: wisdom.tags[0] ?? "general",
      entries: [
        {
          id: "step-1",
          title: "Assess context",
          description: wisdom.reasoning || "Review business context before acting",
          order: 1,
        },
        {
          id: "step-2",
          title: "Execute recommendation",
          description: wisdom.recommendation,
          order: 2,
        },
        {
          id: "step-3",
          title: "Measure outcome",
          description: wisdom.expectedOutcome || "Track results against expected outcome",
          order: 3,
        },
      ],
    });
  }
}
