import { describe,expect,it } from "vitest";
import { buildSkillExecutionPlan } from "./skill-executor";

describe("Samuel skill executor",()=>{
  it("connects lead discovery to the real Revenue radar API",()=>{const plan=buildSkillExecutionPlan({skillId:"find-local-businesses",autonomy:0,companyId:"company-1",input:{query:{sector:"restaurant"}}});expect(plan).toMatchObject({status:"ready",endpoint:"/api/revenue/radar/search",method:"POST"})});
  it("does not claim execution for a registered skill without executor",()=>{const plan=buildSkillExecutionPlan({skillId:"research-company",autonomy:0,companyId:"company-1",input:{}});expect(plan.status).toBe("blocked");expect(plan.reason).toContain("no production executor")});
  it("keeps approval gate before premium website execution",()=>{const plan=buildSkillExecutionPlan({skillId:"create-premium-website",autonomy:1,approved:false,companyId:"company-1",input:{}});expect(plan.status).toBe("approval_required")});
});
