import { buildSamuelCapabilityExecutionPlan } from "../capabilities/samuel-capability-runtime";
import { evaluateSkillExecution } from "./skill-policy";
import { getSamuelSkill } from "./skills-registry";

export type SkillExecutionRequest = {
  skillId: string;
  autonomy: 0 | 1 | 2 | 3;
  approved?: boolean;
  companyId: string;
  input: Record<string, unknown>;
};

export type SkillExecutionPlan = {
  skillId: string;
  agent: string;
  endpoint: string;
  method: "GET" | "POST";
  payload: Record<string, unknown>;
  status: "ready" | "approval_required" | "blocked";
  reason: string;
};

export function buildSkillExecutionPlan(request: SkillExecutionRequest): SkillExecutionPlan {
  const skill = getSamuelSkill(request.skillId);
  if (!skill) {
    return {
      skillId: request.skillId,
      agent: "unknown",
      endpoint: "",
      method: "POST",
      payload: {},
      status: "blocked",
      reason: "Unknown skill",
    };
  }

  const policy = evaluateSkillExecution(
    skill.id,
    request.autonomy,
    Boolean(request.approved),
  );
  if (!policy.allowed) {
    return {
      skillId: skill.id,
      agent: skill.agent,
      endpoint: "",
      method: "POST",
      payload: {},
      status: policy.requiresApproval ? "approval_required" : "blocked",
      reason: policy.reason,
    };
  }

  const capabilityPlan = buildSamuelCapabilityExecutionPlan({
    capabilityId: skill.capabilityId,
    companyId: request.companyId,
    autonomy: request.autonomy,
    approved: request.approved,
    input: request.input,
  });

  if (capabilityPlan.status !== "ready" || !capabilityPlan.executor) {
    return {
      skillId: skill.id,
      agent: skill.agent,
      endpoint: "",
      method: "POST",
      payload: {},
      status: capabilityPlan.status === "approval_required" ? "approval_required" : "blocked",
      reason: `Capability ${capabilityPlan.status}: ${capabilityPlan.reason}`,
    };
  }

  if (capabilityPlan.executor.kind !== "server_route") {
    return {
      skillId: skill.id,
      agent: skill.agent,
      endpoint: "",
      method: "POST",
      payload: {},
      status: "blocked",
      reason: `Capability is connected through ${capabilityPlan.executor.kind}; this legacy skill executor only dispatches verified server routes`,
    };
  }

  return {
    skillId: skill.id,
    agent: skill.agent,
    endpoint: capabilityPlan.executor.endpoint,
    method: capabilityPlan.executor.method,
    payload: capabilityPlan.payload,
    status: "ready",
    reason: capabilityPlan.reason,
  };
}
