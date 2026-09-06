import { getSamuelSkill } from "./skills-registry";

const routes = [
  { patterns:[/encontr.*(cliente|empresa|restaurante|hotel)/i,/find.*(lead|business|company)/i], skill:"find-local-businesses" },
  { patterns:[/pesquis.*empresa/i,/research.*company/i], skill:"research-company" },
  { patterns:[/analis.*site/i,/audit.*website/i], skill:"audit-website" },
  { patterns:[/(cri|faç|faz).*site/i,/create.*website/i], skill:"create-premium-website" },
  { patterns:[/(cri|prepar).*proposta/i,/create.*proposal/i], skill:"create-sales-proposal" },
  { patterns:[/(prepar|escrev).*abordagem/i,/draft.*outreach/i], skill:"draft-outreach" },
  { patterns:[/(atualiz|mov).*crm/i,/update.*crm/i], skill:"manage-crm" },
  { patterns:[/analis.*(anúncio|ads|campanha)/i,/analy.*ads/i], skill:"analyze-ads" },
] as const;

export function routeSamuelSkill(input:string){
  const match=routes.find(route=>route.patterns.some(pattern=>pattern.test(input)));
  return match ? getSamuelSkill(match.skill) : null;
}
