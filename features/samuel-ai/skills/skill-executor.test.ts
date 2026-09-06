import { describe,expect,it } from "vitest";
import { buildSkillExecutionPlan } from "./skill-executor";

describe("Samuel skill executor",()=>{
  it("connects company research to the verified company analysis API",()=>{const plan=buildSkillExecutionPlan({skillId:"research-company",autonomy:0,companyId:"company-1",input:{companyName:"Example"}});expect(plan).toMatchObject({status:"ready",endpoint:"/api/company/analyze",method:"POST"})});
  it("does not claim execution for a skill whose production endpoint is not present",()=>{const plan=buildSkillExecutionPlan({skillId:"find-local-businesses",autonomy:0,companyId:"company-1",input:{}});expect(plan.status).toBe("blocked");expect(plan.reason).toContain("no verified production executor")});
  it("keeps approval gate before premium website execution",()=>{const plan=buildSkillExecutionPlan({skillId:"create-premium-website",autonomy:1,approved:false,companyId:"company-1",input:{}});expect(plan.status).toBe("approval_required")});
});
