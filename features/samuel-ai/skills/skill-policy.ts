import { getSamuelSkill } from "./skills-registry";

export type SkillExecutionDecision = { allowed:boolean; requiresApproval:boolean; reason:string };

export function evaluateSkillExecution(skillId:string, autonomy:0|1|2|3, approved=false):SkillExecutionDecision {
  const skill=getSamuelSkill(skillId);
  if(!skill) return {allowed:false,requiresApproval:false,reason:"Unknown skill"};
  if(autonomy < skill.minimumAutonomy) return {allowed:false,requiresApproval:true,reason:`Requires autonomy level ${skill.minimumAutonomy} or higher`};
  if(skill.requiresApproval && !approved) return {allowed:false,requiresApproval:true,reason:"Human approval required"};
  return {allowed:true,requiresApproval:false,reason:"Execution permitted by skill policy"};
}

export function assertNoSecretExposure(tool:string){
  const forbidden=["api_key","secret","service_role","private_key","password"];
  if(forbidden.some(token=>tool.toLowerCase().includes(token))) throw new Error("Secrets cannot be exposed through skill tool identifiers");
}
