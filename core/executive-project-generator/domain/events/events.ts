import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject, ProjectBusinessCase, ProjectRoadmap } from "../entities";

export type ProjectGeneratedPayload = { project: ReturnType<ExecutiveProject["toJSON"]> };
export type ProjectGeneratedEvent = DomainEvent<ProjectGeneratedPayload>;
export function createProjectGeneratedEvent(project: ExecutiveProject): ProjectGeneratedEvent {
  return createDomainEvent({
    eventType: "ProjectGenerated",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON() },
  });
}

export type BusinessCaseCreatedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  businessCase: ReturnType<ProjectBusinessCase["toJSON"]>;
};
export type BusinessCaseCreatedEvent = DomainEvent<BusinessCaseCreatedPayload>;
export function createBusinessCaseCreatedEvent(
  project: ExecutiveProject,
  businessCase: ProjectBusinessCase,
): BusinessCaseCreatedEvent {
  return createDomainEvent({
    eventType: "BusinessCaseCreated",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), businessCase: businessCase.toJSON() },
  });
}

export type RoadmapCreatedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  roadmap: ReturnType<ProjectRoadmap["toJSON"]>;
};
export type RoadmapCreatedEvent = DomainEvent<RoadmapCreatedPayload>;
export function createRoadmapCreatedEvent(
  project: ExecutiveProject,
  roadmap: ProjectRoadmap,
): RoadmapCreatedEvent {
  return createDomainEvent({
    eventType: "RoadmapCreated",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), roadmap: roadmap.toJSON() },
  });
}

export type ProjectApprovedPayload = { project: ReturnType<ExecutiveProject["toJSON"]>; approvedBy: string };
export type ProjectApprovedEvent = DomainEvent<ProjectApprovedPayload>;
export function createProjectApprovedEvent(project: ExecutiveProject, approvedBy: string): ProjectApprovedEvent {
  return createDomainEvent({
    eventType: "ProjectApproved",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), approvedBy },
  });
}

export type ProjectRejectedPayload = { project: ReturnType<ExecutiveProject["toJSON"]>; rejectedBy: string; reason: string };
export type ProjectRejectedEvent = DomainEvent<ProjectRejectedPayload>;
export function createProjectRejectedEvent(project: ExecutiveProject, rejectedBy: string, reason: string): ProjectRejectedEvent {
  return createDomainEvent({
    eventType: "ProjectRejected",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), rejectedBy, reason },
  });
}

export type ProjectStartedPayload = { project: ReturnType<ExecutiveProject["toJSON"]>; startedBy: string };
export type ProjectStartedEvent = DomainEvent<ProjectStartedPayload>;
export function createProjectStartedEvent(project: ExecutiveProject, startedBy: string): ProjectStartedEvent {
  return createDomainEvent({
    eventType: "ProjectStarted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    companyId: project.companyId,
    payload: { project: project.toJSON(), startedBy },
  });
}

