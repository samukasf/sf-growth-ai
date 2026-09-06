import { NextResponse } from "next/server";
import { buildSkillExecutionPlan, type SkillExecutionRequest } from "@/features/samuel-ai/skills/skill-executor";

export async function POST(request:Request){
  try{
    const body=await request.json() as Partial<SkillExecutionRequest>;
    if(!body.skillId || !body.companyId || body.autonomy===undefined) return NextResponse.json({error:"skillId, companyId and autonomy are required"},{status:400});
    const plan=buildSkillExecutionPlan({skillId:body.skillId,companyId:body.companyId,autonomy:body.autonomy,approved:body.approved,input:body.input ?? {}});
    return NextResponse.json({plan},{status:plan.status==="blocked"?409:200});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Unknown error"},{status:500});
  }
}
