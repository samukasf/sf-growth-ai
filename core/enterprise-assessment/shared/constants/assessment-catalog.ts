import type { AssessmentDimensionKey } from "../types";

export type DefaultQuestionTemplate = {
  dimensionKey: AssessmentDimensionKey;
  text: string;
  weight: number;
  required: boolean;
};

export const DEFAULT_ASSESSMENT_QUESTIONS: DefaultQuestionTemplate[] = [
  { dimensionKey: "estrategia", text: "A empresa possui visão e missão documentadas?", weight: 1, required: true },
  { dimensionKey: "estrategia", text: "Existem objetivos estratégicos para os próximos 12 meses?", weight: 1, required: true },
  { dimensionKey: "estrategia", text: "Decisões estratégicas são baseadas em dados?", weight: 1.2, required: true },
  { dimensionKey: "marketing", text: "Os canais de aquisição são medidos e otimizados?", weight: 1, required: true },
  { dimensionKey: "marketing", text: "Existe estratégia de conteúdo e presença digital?", weight: 1, required: true },
  { dimensionKey: "marketing", text: "O CAC e ROI por canal são conhecidos?", weight: 1.1, required: false },
  { dimensionKey: "vendas", text: "O pipeline comercial é visível em tempo real?", weight: 1.2, required: true },
  { dimensionKey: "vendas", text: "Existe processo de follow-up sistemático?", weight: 1, required: true },
  { dimensionKey: "vendas", text: "A taxa de conversão é monitorizada?", weight: 1, required: true },
  { dimensionKey: "financeiro", text: "A margem por projeto/produto é conhecida?", weight: 1.2, required: true },
  { dimensionKey: "financeiro", text: "O fluxo de caixa é projetado regularmente?", weight: 1.1, required: true },
  { dimensionKey: "financeiro", text: "Indicadores financeiros são revisados mensalmente?", weight: 1, required: true },
  { dimensionKey: "operacoes", text: "Processos críticos estão documentados?", weight: 1, required: true },
  { dimensionKey: "operacoes", text: "A produção/operação tem indicadores de eficiência?", weight: 1.1, required: true },
  { dimensionKey: "operacoes", text: "Gargalos operacionais são identificados e tratados?", weight: 1, required: true },
  { dimensionKey: "rh", text: "Funções e responsabilidades estão claras?", weight: 1, required: true },
  { dimensionKey: "rh", text: "Existe plano de sucessão para funções críticas?", weight: 0.9, required: false },
  { dimensionKey: "rh", text: "A equipa recebe feedback regular sobre prioridades?", weight: 0.9, required: false },
  { dimensionKey: "tecnologia", text: "Os sistemas (ERP, CRM) estão integrados?", weight: 1.2, required: true },
  { dimensionKey: "tecnologia", text: "Existe responsável ou roadmap tecnológico?", weight: 1, required: true },
  { dimensionKey: "tecnologia", text: "Backups e segurança são testados regularmente?", weight: 1, required: false },
  { dimensionKey: "automacao", text: "Tarefas repetitivas são automatizadas?", weight: 1.1, required: true },
  { dimensionKey: "automacao", text: "Alertas automáticos substituem verificação manual?", weight: 1, required: true },
  { dimensionKey: "automacao", text: "Existe mapa de automações prioritárias?", weight: 0.9, required: false },
  { dimensionKey: "experiencia_cliente", text: "A jornada do cliente está mapeada?", weight: 1, required: true },
  { dimensionKey: "experiencia_cliente", text: "NPS ou satisfação são medidos?", weight: 1, required: true },
  { dimensionKey: "experiencia_cliente", text: "SLAs de atendimento são cumpridos?", weight: 1.1, required: true },
  { dimensionKey: "comunicacao", text: "Decisões são documentadas e comunicadas?", weight: 1, required: true },
  { dimensionKey: "comunicacao", text: "A comunicação interna é estruturada?", weight: 0.9, required: false },
  { dimensionKey: "comunicacao", text: "Rituais executivos existem (diário, semanal)?", weight: 1, required: true },
  { dimensionKey: "dados", text: "Existe fonte única de verdade para dados?", weight: 1.2, required: true },
  { dimensionKey: "dados", text: "Dados são atualizados com frequência adequada?", weight: 1, required: true },
  { dimensionKey: "dados", text: "KPIs são acessíveis sem compilação manual?", weight: 1.1, required: true },
  { dimensionKey: "inteligencia_artificial", text: "A empresa está preparada para usar IA executiva?", weight: 1, required: true },
  { dimensionKey: "inteligencia_artificial", text: "Dados estão estruturados para alimentar IA?", weight: 1.1, required: true },
  { dimensionKey: "inteligencia_artificial", text: "Existe champion interno para adoção de IA?", weight: 0.9, required: false },
];

const BASELINE_SCORES: Record<AssessmentDimensionKey, number> = {
  estrategia: 45,
  marketing: 38,
  vendas: 42,
  financeiro: 48,
  operacoes: 40,
  rh: 50,
  tecnologia: 35,
  automacao: 25,
  experiencia_cliente: 44,
  comunicacao: 46,
  dados: 32,
  inteligencia_artificial: 28,
};

export function getBaselineScoreForDimension(key: AssessmentDimensionKey): number {
  return BASELINE_SCORES[key];
}
