import {
  ProjectRequirement,
  type ExecutiveProject,
  type RequirementGenerator,
} from "../../domain";

const REQUIREMENTS_BY_TYPE: Record<
  ExecutiveProject["projectType"],
  Array<{ title: string; description: string; priority: "must_have" | "should_have" | "nice_to_have" }>
> = {
  website: [
    { title: "Design responsivo", description: "Layout adaptável para mobile e desktop.", priority: "must_have" },
    { title: "SEO básico", description: "Meta tags, sitemap e performance.", priority: "should_have" },
    { title: "Formulário de contato", description: "Captura de leads com notificação.", priority: "must_have" },
  ],
  mobile_app: [
    { title: "Autenticação", description: "Login seguro com recuperação de senha.", priority: "must_have" },
    { title: "Notificações push", description: "Alertas para engajamento do usuário.", priority: "should_have" },
    { title: "Offline básico", description: "Cache de dados essenciais.", priority: "nice_to_have" },
  ],
  web_system: [
    { title: "Gestão de usuários", description: "Perfis, permissões e auditoria.", priority: "must_have" },
    { title: "Módulos operacionais", description: "CRUD dos processos principais.", priority: "must_have" },
    { title: "Relatórios", description: "Exportação e filtros avançados.", priority: "should_have" },
  ],
  crm: [
    { title: "Cadastro de leads", description: "Importação e qualificação de leads.", priority: "must_have" },
    { title: "Pipeline de vendas", description: "Funil com etapas configuráveis.", priority: "must_have" },
    { title: "Histórico de interações", description: "Registro de contatos e follow-ups.", priority: "must_have" },
  ],
  scheduling: [
    { title: "Calendário", description: "Agendamento com disponibilidade.", priority: "must_have" },
    { title: "Confirmações", description: "Lembretes por e-mail/WhatsApp.", priority: "must_have" },
    { title: "Gestão de horários", description: "Bloqueios e feriados.", priority: "should_have" },
  ],
  delivery: [
    { title: "Cardápio digital", description: "Produtos, preços e variações.", priority: "must_have" },
    { title: "Gestão de pedidos", description: "Status em tempo real.", priority: "must_have" },
    { title: "Rastreamento", description: "Tracking de entrega.", priority: "should_have" },
  ],
  loyalty: [
    { title: "Motor de pontos", description: "Acúmulo e resgate de pontos.", priority: "must_have" },
    { title: "Níveis de fidelidade", description: "Tiers com benefícios progressivos.", priority: "should_have" },
    { title: "Campanhas", description: "Promoções segmentadas.", priority: "nice_to_have" },
  ],
  automation: [
    { title: "Mapeamento de processo", description: "Documentação do fluxo atual.", priority: "must_have" },
    { title: "Workflow automatizado", description: "Execução sem intervenção manual.", priority: "must_have" },
    { title: "Monitoramento", description: "Alertas de falhas e retries.", priority: "should_have" },
  ],
  dashboard: [
    { title: "KPIs definidos", description: "Métricas alinhadas com objetivos.", priority: "must_have" },
    { title: "Visualizações", description: "Gráficos e tabelas interativas.", priority: "must_have" },
    { title: "Alertas", description: "Notificações de desvios.", priority: "should_have" },
  ],
  integration: [
    { title: "Conectores", description: "Integração com sistemas fonte e destino.", priority: "must_have" },
    { title: "Sincronização", description: "Mapeamento e transformação de dados.", priority: "must_have" },
    { title: "Monitoramento", description: "Logs e health checks.", priority: "should_have" },
  ],
  internal_process: [
    { title: "Fluxo digital", description: "Substituição do processo manual.", priority: "must_have" },
    { title: "Aprovações", description: "Workflow com múltiplos níveis.", priority: "must_have" },
    { title: "Auditoria", description: "Rastreabilidade de ações.", priority: "should_have" },
  ],
};

export class DefaultRequirementGenerator implements RequirementGenerator {
  generate(project: ExecutiveProject): ProjectRequirement[] {
    const templates = REQUIREMENTS_BY_TYPE[project.projectType];

    return templates.map((template) =>
      ProjectRequirement.create({
        companyId: project.companyId,
        projectId: project.id,
        title: template.title,
        description: template.description,
        priority: template.priority,
        complexity: project.complexity,
        acceptanceCriteria: [
          `Requisito validado por stakeholder`,
          `Testado em ambiente de homologação`,
        ],
      }),
    );
  }
}
