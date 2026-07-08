import {
  ArchitectureBlueprint,
  type ModulePlanner,
  type PlanModulesInput,
} from "../../domain";

export class DefaultModulePlanner implements ModulePlanner {
  plan(input: PlanModulesInput): ArchitectureBlueprint {
    const { architecture } = input;
    return ArchitectureBlueprint.create({
      ...architecture.toJSON(),
      modules: [
        {
          id: `mod-${architecture.id}-1`,
          blueprintId: architecture.id,
          name: "core-domain",
          responsibility: "Regras de negócio centrais",
          dependencies: [],
          interfaces: ["domain services", "entities"],
        },
        {
          id: `mod-${architecture.id}-2`,
          blueprintId: architecture.id,
          name: "application-services",
          responsibility: "Orquestração de casos de uso",
          dependencies: ["core-domain"],
          interfaces: ["use cases", "ports"],
        },
        {
          id: `mod-${architecture.id}-3`,
          blueprintId: architecture.id,
          name: "integration-layer",
          responsibility: "Integrações e persistência",
          dependencies: ["application-services"],
          interfaces: ["repositories", "adapters"],
        },
      ],
    });
  }
}

