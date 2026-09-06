export type SamuelSkillRisk = "low" | "medium" | "high";
export type SamuelSkill = {
  id: string;
  name: string;
  description: string;
  agent: string;
  tools: string[];
  risk: SamuelSkillRisk;
  minimumAutonomy: 0 | 1 | 2 | 3;
  requiresApproval: boolean;
  expectedOutput: string;
};

export const SAMUEL_SKILLS: SamuelSkill[] = [
  { id:"find-local-businesses", name:"Find Local Businesses", description:"Descobre empresas reais através de fontes conectadas e preserva proveniência.", agent:"market", tools:["lead-discovery"], risk:"low", minimumAutonomy:0, requiresApproval:false, expectedOutput:"Leads com fonte e confiança" },
  { id:"research-company", name:"Research Company", description:"Pesquisa presença digital e organiza evidências sem inventar dados.", agent:"lead_research", tools:["web-research"], risk:"low", minimumAutonomy:0, requiresApproval:false, expectedOutput:"Dossiê verificável da empresa" },
  { id:"audit-website", name:"Audit Website", description:"Avalia presença, conversão, mobile, conteúdo e oportunidades do website.", agent:"lead_research", tools:["web-research","site-quality-gate"], risk:"low", minimumAutonomy:0, requiresApproval:false, expectedOutput:"Diagnóstico e oportunidades" },
  { id:"create-premium-website", name:"Create Premium Website", description:"Cria conceito e demonstração premium a partir de dados reais do lead.", agent:"creative", tools:["site-creative-director","site-builder","site-quality-gate"], risk:"medium", minimumAutonomy:1, requiresApproval:true, expectedOutput:"Preview aprovado pelo quality gate" },
  { id:"create-sales-proposal", name:"Create Sales Proposal", description:"Prepara proposta com oferta e política comercial cadastradas.", agent:"closer", tools:["crm","proposal-builder"], risk:"medium", minimumAutonomy:1, requiresApproval:true, expectedOutput:"Proposta pronta para aprovação" },
  { id:"draft-outreach", name:"Draft Outreach", description:"Prepara abordagem personalizada usando evidências reais do lead.", agent:"outreach", tools:["crm","email"], risk:"medium", minimumAutonomy:1, requiresApproval:true, expectedOutput:"Mensagem pronta para aprovação" },
  { id:"manage-crm", name:"Manage CRM", description:"Atualiza estágio, tarefas e próxima melhor ação dentro da organização correta.", agent:"crm", tools:["crm"], risk:"medium", minimumAutonomy:1, requiresApproval:false, expectedOutput:"CRM atualizado e auditável" },
  { id:"analyze-ads", name:"Analyze Ads", description:"Analisa performance e recomenda manter, parar, aumentar ou testar.", agent:"ads", tools:["ads-connectors"], risk:"low", minimumAutonomy:0, requiresApproval:false, expectedOutput:"Recomendação explicável" },
];

export function getSamuelSkill(id:string){ return SAMUEL_SKILLS.find(skill=>skill.id===id) ?? null; }
