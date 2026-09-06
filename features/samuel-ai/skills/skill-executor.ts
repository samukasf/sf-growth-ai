import { evaluateSkillExecution } from "./skill-policy";
import { getSamuelSkill } from "./skills-registry";

export type SkillExecutionRequest = { skillId:string; autonomy:0|1|2|3; approved?:boolean; companyId:string; input:Record<string,unknown> };
export type SkillExecutionPlan = { skillId:string; agent:string; endpoint:string; method:"GET"|"POST"; payload:Record<string,unknown>; status:"ready"|"approval_required"|"blocked"; reason:string };

const executableRoutes:Record<string,{endpoint:string;method:"GET"|"POST"}> = {
  "research-company": { endpoint:"/api/company/analyze", method:"POST" },
};

export function buildSkillExecutionPlan(request:SkillExecutionRequest):SkillExecutionPlan {
  const skill=getSamuelSkill(request.skillId);
  if(!skill) return {skillId:request.skillId,agent:"unknown",endpoint:"",method:"POST",payload:{},status:"blocked",reason:"Unknown skill"};
  const policy=evaluateSkillExecution(skill.id,request.autonomy,Boolean(request.approved));
  if(!policy.allowed) return {skillId:skill.id,agent:skill.agent,endpoint:"",method:"POST",payload:{},status:policy.requiresApproval?"approval_required":"blocked",reason:policy.reason};
  const route=executableRoutes[skill.id];
  if(!route) return {skillId:skill.id,agent:skill.agent,endpoint:"",method:"POST",payload:{},status:"blocked",reason:"Skill registered but no verified production executor is connected yet"};
  return {skillId:skill.id,agent:skill.agent,...route,payload:{companyId:request.companyId,...request.input},status:"ready",reason:"Verified production executor available"};
}
