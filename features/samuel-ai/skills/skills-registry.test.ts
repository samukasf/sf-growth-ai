import { describe,expect,it } from "vitest";
import { SAMUEL_SKILLS } from "./skills-registry";
import { evaluateSkillExecution } from "./skill-policy";
import { routeSamuelSkill } from "./skill-router";

describe("Samuel Skills Runtime",()=>{
  it("keeps skill ids unique",()=>{expect(new Set(SAMUEL_SKILLS.map(s=>s.id)).size).toBe(SAMUEL_SKILLS.length)});
  it("routes website creation",()=>{expect(routeSamuelSkill("Faça um site premium para este restaurante")?.id).toBe("create-premium-website")});
  it("routes lead discovery",()=>{expect(routeSamuelSkill("Encontre empresas em Lisboa")?.id).toBe("find-local-businesses")});
  it("blocks approval-gated skills",()=>{expect(evaluateSkillExecution("create-premium-website",1,false)).toMatchObject({allowed:false,requiresApproval:true})});
  it("allows approved governed execution",()=>{expect(evaluateSkillExecution("create-premium-website",1,true).allowed).toBe(true)});
  it("does not route unsupported commands to fake capabilities",()=>{expect(routeSamuelSkill("Compre ações automaticamente")).toBeNull()});
});
