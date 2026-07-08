import { createDomainEvent, type DomainEvent } from "../../shared";
import type {
  ArchitectureBlueprint,
  DeploymentPlan,
  SoftwareProject,
  SoftwareSpecification,
} from "../entities";

export type SoftwareRequestedPayload = { project: ReturnType<SoftwareProject["toJSON"]> };
export type SoftwareRequestedEvent = DomainEvent<SoftwareRequestedPayload>;
export function createSoftwareRequestedEvent(project: SoftwareProject): SoftwareRequestedEvent {
  return createDomainEvent({
    eventType: "SoftwareRequested",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON() },
  });
}

export type RequirementsCompletedPayload = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  specification: ReturnType<SoftwareSpecification["toJSON"]>;
};
export type RequirementsCompletedEvent = DomainEvent<RequirementsCompletedPayload>;
export function createRequirementsCompletedEvent(
  project: SoftwareProject,
  specification: SoftwareSpecification,
): RequirementsCompletedEvent {
  return createDomainEvent({
    eventType: "RequirementsCompleted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), specification: specification.toJSON() },
  });
}

export type ArchitectureGeneratedPayload = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  blueprint: ReturnType<ArchitectureBlueprint["toJSON"]>;
};
export type ArchitectureGeneratedEvent = DomainEvent<ArchitectureGeneratedPayload>;
export function createArchitectureGeneratedEvent(
  project: SoftwareProject,
  blueprint: ArchitectureBlueprint,
): ArchitectureGeneratedEvent {
  return createDomainEvent({
    eventType: "ArchitectureGenerated",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), blueprint: blueprint.toJSON() },
  });
}

export type ProjectApprovedPayload = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  approvedBy: string;
};
export type ProjectApprovedEvent = DomainEvent<ProjectApprovedPayload>;
export function createProjectApprovedEvent(
  project: SoftwareProject,
  approvedBy: string,
): ProjectApprovedEvent {
  return createDomainEvent({
    eventType: "ProjectApproved",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), approvedBy },
  });
}

export type GenerationStartedPayload = { project: ReturnType<SoftwareProject["toJSON"]> };
export type GenerationStartedEvent = DomainEvent<GenerationStartedPayload>;
export function createGenerationStartedEvent(project: SoftwareProject): GenerationStartedEvent {
  return createDomainEvent({
    eventType: "GenerationStarted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON() },
  });
}

export type GenerationCompletedPayload = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  artifactCount: number;
};
export type GenerationCompletedEvent = DomainEvent<GenerationCompletedPayload>;
export function createGenerationCompletedEvent(
  project: SoftwareProject,
  artifactCount: number,
): GenerationCompletedEvent {
  return createDomainEvent({
    eventType: "GenerationCompleted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), artifactCount },
  });
}

export type DeploymentPreparedPayload = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  plan: ReturnType<DeploymentPlan["toJSON"]>;
};
export type DeploymentPreparedEvent = DomainEvent<DeploymentPreparedPayload>;
export function createDeploymentPreparedEvent(
  project: SoftwareProject,
  plan: DeploymentPlan,
): DeploymentPreparedEvent {
  return createDomainEvent({
    eventType: "DeploymentPrepared",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), plan: plan.toJSON() },
  });
}

