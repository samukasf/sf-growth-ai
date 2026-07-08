import type {
  CompanyId,
  ExecutiveMissionId,
  MissionExecutionId,
  OrganizationId,
} from "../../shared";
import type { ExecutiveMission, MissionAlert, MissionExecution, MissionRecommendation, MissionResult } from "../entities";

export type MissionRunContext = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  context?: Record<string, unknown>;
};

export type MissionOpportunity = {
  id: string;
  title: string;
  description: string;
  category?: string;
  estimatedROI?: number;
  confidence?: number;
  metadata?: Record<string, unknown>;
};

export interface MissionRepository {
  saveMission(mission: ExecutiveMission): Promise<void>;
  findMissionById(id: ExecutiveMissionId): Promise<ExecutiveMission | null>;
  findMissionsByCompany(companyId: CompanyId): Promise<ExecutiveMission[]>;
  findMissionsByOrganization(organizationId: OrganizationId): Promise<ExecutiveMission[]>;

  saveExecution(execution: MissionExecution): Promise<void>;
  findExecutionById(id: MissionExecutionId): Promise<MissionExecution | null>;
  findExecutionsByMission(missionId: ExecutiveMissionId): Promise<MissionExecution[]>;

  saveResult(result: MissionResult): Promise<void>;
  findResultsByMission(missionId: ExecutiveMissionId): Promise<MissionResult[]>;

  saveAlert(alert: MissionAlert): Promise<void>;
  findAlertsByMission(missionId: ExecutiveMissionId): Promise<MissionAlert[]>;

  saveRecommendation(recommendation: MissionRecommendation): Promise<void>;
  findRecommendationsByMission(missionId: ExecutiveMissionId): Promise<MissionRecommendation[]>;
}

export type MissionPlan = {
  missionId: ExecutiveMissionId;
  nextRunAt: string;
  inputs: Record<string, unknown>;
};

export interface MissionPlanner {
  plan(mission: ExecutiveMission, ctx: MissionRunContext): MissionPlan;
}

export interface MissionScheduler {
  computeNextRunAt(mission: ExecutiveMission, lastRunAt?: string): string;
  shouldRun(mission: ExecutiveMission, nowIso: string): boolean;
}

export type MissionRunInput = {
  mission: ExecutiveMission;
  plan: MissionPlan;
  ctx: MissionRunContext;
};

export type MissionRunOutput = {
  logs: string[];
  findings: string[];
  opportunities: MissionOpportunity[];
  alerts: { severity: "info" | "warning" | "critical"; title: string; description: string }[];
};

export interface MissionRunner {
  run(input: MissionRunInput): Promise<MissionRunOutput>;
}

export type MissionEvaluationInput = {
  mission: ExecutiveMission;
  execution: MissionExecution;
  output: MissionRunOutput;
};

export type MissionEvaluationOutput = {
  result: MissionResult;
  recommendations: MissionRecommendation[];
  alerts: MissionAlert[];
  opportunities: MissionOpportunity[];
};

export interface MissionEvaluator {
  evaluate(input: MissionEvaluationInput): MissionEvaluationOutput;
}

export type MissionReport = {
  missionId: ExecutiveMissionId;
  executionId: MissionExecutionId;
  summary: string;
  highlights: string[];
  metrics: Record<string, number>;
};

export interface MissionReporter {
  buildReport(input: { mission: ExecutiveMission; result: MissionResult; recommendations: MissionRecommendation[] }): MissionReport;
}

export interface MissionNotificationEngine {
  notify(input: { mission: ExecutiveMission; report: MissionReport; alerts: MissionAlert[] }): Promise<void>;
}

export type RunMissionInput = {
  missionId: ExecutiveMissionId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  context?: Record<string, unknown>;
};

export type RunMissionResult = {
  mission: ReturnType<ExecutiveMission["toJSON"]>;
  execution: ReturnType<MissionExecution["toJSON"]>;
  result: ReturnType<MissionResult["toJSON"]>;
  recommendations: ReturnType<MissionRecommendation["toJSON"]>[];
  alerts: ReturnType<MissionAlert["toJSON"]>[];
  opportunities: MissionOpportunity[];
  report: MissionReport;
};

export type CreateMissionInput = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  title: string;
  description: string;
  category: ExecutiveMission["category"];
  objective: ExecutiveMission["objective"]["toJSON"];
  priority: ExecutiveMission["priority"];
  frequency: ExecutiveMission["frequency"];
  owner: string;
  expectedImpact: number;
  estimatedROI: number;
  relatedDepartments: string[];
};

export interface MissionEngine {
  createMission(input: CreateMissionInput): Promise<ExecutiveMission>;
  runMission(input: RunMissionInput): Promise<RunMissionResult>;
  runCompanyCycle(input: { organizationId: OrganizationId; companyId: CompanyId; context?: Record<string, unknown> }): Promise<RunMissionResult[]>;
}

