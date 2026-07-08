import { SoftwareSpecification, type BuildSpecificationInput, type SpecificationBuilder } from "../../domain";

export class DefaultSpecificationBuilder implements SpecificationBuilder {
  build(input: BuildSpecificationInput): SoftwareSpecification {
    const { project, businessRequirements, functionalRequirements, technicalRequirements } = input;
    return SoftwareSpecification.create({
      projectId: project.id,
      summary: `Especificação consolidada para ${project.title}`,
      businessRequirements: businessRequirements.toJSON(),
      functionalRequirements: functionalRequirements.toJSON(),
      technicalRequirements: technicalRequirements.toJSON(),
    });
  }
}

