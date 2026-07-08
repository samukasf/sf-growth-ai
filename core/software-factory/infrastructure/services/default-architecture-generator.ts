import {
  ArchitectureBlueprint,
  type ArchitectureGenerator,
  type GenerateArchitectureInput,
} from "../../domain";

export class DefaultArchitectureGenerator implements ArchitectureGenerator {
  generate(input: GenerateArchitectureInput): ArchitectureBlueprint {
    const { project } = input;
    return ArchitectureBlueprint.create({
      projectId: project.id,
      style: project.projectType === "microservice" ? "microservices" : "modular-monolith",
      layers: ["presentation", "application", "domain", "infrastructure"],
      dataStrategy: "transactional database with reporting views",
      modules: [],
    });
  }
}

