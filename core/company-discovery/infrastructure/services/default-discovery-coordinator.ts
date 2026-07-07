import { DiscoveryFinding, DiscoverySource } from "../../domain";
import type {
  CoordinateDiscoveryInput,
  CoordinateDiscoveryResult,
  DiscoveryCoordinator,
} from "../../domain";

export class DefaultDiscoveryCoordinator implements DiscoveryCoordinator {
  async coordinate(input: CoordinateDiscoveryInput): Promise<CoordinateDiscoveryResult> {
    const sources: DiscoverySource[] = [];
    const findings: DiscoveryFinding[] = [];

    for (const sourceType of input.sourceTypes) {
      const provider = input.providers.find((p) => p.sourceType === sourceType);
      if (!provider) continue;

      const source = DiscoverySource.create({
        sessionId: input.session.id,
        sourceType,
        label: provider.label,
        endpoint: String(input.context[`${sourceType}_endpoint`] ?? ""),
        status: "pending",
      });

      if (!provider.isAvailable(input.context)) {
        sources.push(source.withStatus("skipped"));
        continue;
      }

      try {
        const result = await provider.collect({
          session: input.session,
          sourceType,
          context: input.context,
        });

        sources.push(
          source.withCollection(result.itemsCollected, result.confidence).withStatus("completed"),
        );
        findings.push(...result.findings);
      } catch {
        sources.push(source.withStatus("failed"));
      }
    }

    return {
      sources,
      findings,
      session: input.session.withStatus("collecting"),
    };
  }
}
