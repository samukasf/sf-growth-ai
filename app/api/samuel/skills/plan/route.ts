import { NextResponse } from "next/server";
import { buildSkillExecutionPlan, type SkillExecutionRequest } from "@/features/samuel-ai/skills/skill-executor";
import { RevenueAuthError, requireRevenueCompanyAccess } from "@/apps/web/src/features/revenue/revenue-auth";

export async function POST(request:Request){
  try{
    const body=await request.json() as Partial<SkillExecutionRequest>;
    if(!body.skillId || !body.companyId || body.autonomy===undefined) return NextResponse.json({error:"skillId, companyId and autonomy are required"},{status:400});
    await requireRevenueCompanyAccess(request,body.companyId);
    const plan=buildSkillExecutionPlan({skillId:body.skillId,companyId:body.companyId,autonomy:body.autonomy,approved:body.approved,input:body.input ?? {}});
    return NextResponse.json({plan},{status:plan.status==="blocked"?409:200});
  }catch(error){
    const status=error instanceof RevenueAuthError?error.status:500;
    return NextResponse.json({error:error instanceof Error?error.message:"Unknown error"},{status});
  }
}
