import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveMission, MissionAlert, MissionExecution, MissionResult } from "../entities";

export type MissionCreatedPayload = { mission: ReturnType<ExecutiveMission["toJSON"]> };
export type MissionCreatedEvent = DomainEvent<MissionCreatedPayload>;
export function createMissionCreatedEvent(mission: ExecutiveMission): MissionCreatedEvent {
  return createDomainEvent({
    eventType: "MissionCreated",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON() },
  });
}

export type MissionStartedPayload = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  execution: ReturnType<MissionExecution["toJSON"]>;
};
export type MissionStartedEvent = DomainEvent<MissionStartedPayload>;
export function createMissionStartedEvent(
  mission: ExecutiveMission,
  execution: MissionExecution,
): MissionStartedEvent {
  return createDomainEvent({
    eventType: "MissionStarted",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON(), execution: execution.toJSON() },
  });
}

export type MissionCompletedPayload = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  execution: ReturnType<MissionExecution["toJSON"]>;
  result: ReturnType<MissionResult["toJSON"]>;
};
export type MissionCompletedEvent = DomainEvent<MissionCompletedPayload>;
export function createMissionCompletedEvent(
  mission: ExecutiveMission,
  execution: MissionExecution,
  result: MissionResult,
): MissionCompletedEvent {
  return createDomainEvent({
    eventType: "MissionCompleted",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON(), execution: execution.toJSON(), result: result.toJSON() },
  });
}

export type MissionFailedPayload = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  execution: ReturnType<MissionExecution["toJSON"]>;
  reason: string;
};
export type MissionFailedEvent = DomainEvent<MissionFailedPayload>;
export function createMissionFailedEvent(
  mission: ExecutiveMission,
  execution: MissionExecution,
  reason: string,
): MissionFailedEvent {
  return createDomainEvent({
    eventType: "MissionFailed",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON(), execution: execution.toJSON(), reason },
  });
}

export type MissionOpportunityFoundPayload = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  execution: ReturnType<MissionExecution["toJSON"]>;
  opportunities: Record<string, unknown>[];
};
export type MissionOpportunityFoundEvent = DomainEvent<MissionOpportunityFoundPayload>;
export function createMissionOpportunityFoundEvent(
  mission: ExecutiveMission,
  execution: MissionExecution,
  opportunities: Record<string, unknown>[],
): MissionOpportunityFoundEvent {
  return createDomainEvent({
    eventType: "MissionOpportunityFound",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON(), execution: execution.toJSON(), opportunities },
  });
}

export type MissionAlertGeneratedPayload = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  alert: ReturnType<MissionAlert["toJSON"]>;
};
export type MissionAlertGeneratedEvent = DomainEvent<MissionAlertGeneratedPayload>;
export function createMissionAlertGeneratedEvent(
  mission: ExecutiveMission,
  alert: MissionAlert,
): MissionAlertGeneratedEvent {
  return createDomainEvent({
    eventType: "MissionAlertGenerated",
    aggregateId: mission.id,
    organizationId: mission.organizationId,
    companyId: mission.companyId,
    payload: { mission: mission.toJSON(), alert: alert.toJSON() },
  });
}

