# SF Growth AI — Arquitetura

> Versão: 1.0  
> Sprint: 45A — Project Foundation  
> Data: Julho 2026  
> Status: Documentação oficial da arquitetura atual

---

## Visão Geral

O SF Growth AI é uma aplicação **Next.js 16** com renderização server-side (SSR) na rota principal `/samuel-ai`. A arquitetura segue um modelo de **pipeline executivo**: dados são carregados do Supabase e integrações externas, processados por engines especializadas e entregues à interface via props — sem mutação no cliente durante o carregamento inicial.

```
┌─────────────────────────────────────────────────────────────────┐
│                        app/samuel-ai/page.tsx                   │
│                     (SSR Pipeline — Server)                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  Executive Context        Executive Engines        Executive Modules
  (Supabase)             (13 engines)             (12 módulos)
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    Executive Watchers (Market, SEO, Core)
                                │
                                ▼
                      Executive CEO + Briefing
                                │
                                ▼
                    SamuelAiPage → Executive Workspace
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Dados | Supabase (PostgreSQL + SSR client) |
| Integrações | Google Analytics, Search Console, Google Business, Meta |
| Linguagem | TypeScript 5 |

---

## Executive Workspace

**Localização:** `features/samuel-ai/components/executive-workspace/`

O Executive Workspace é a interface principal do produto. Organiza 19 seções de navegação em quatro grupos:

| Grupo | Seções |
|---|---|
| **Núcleo** | Executive Inbox, Dashboard, Samuel AI |
| **Executivo** | Alerts, Timeline, Agenda, Tasks, Watchers |
| **Módulos** | Marketing, Sales, Finance, Operations, HR, Legal |
| **Integrações** | Google Business, Google Analytics, Search Console, Meta, LinkedIn |

### Componentes principais

- `ExecutiveWorkspace` — Layout com sidebar, centro e painel direito
- `ExecutiveSidebar` — Navegação entre seções
- `ExecutiveWorkspaceCenter` — Conteúdo dinâmico por seção
- `SamuelAiShell` — Orquestração client-side (chat, experiência executiva)
- `ExecutiveExperience` — Estados visuais da experiência executiva
- `ChatPanel` — Interface conversacional com Samuel AI

### Fluxo de dados

1. `app/samuel-ai/page.tsx` executa o pipeline SSR completo
2. Resultados são passados como props para `SamuelAiPage`
3. `SamuelAiShell` distribui dados ao `ExecutiveWorkspace` e componentes filhos
4. Interações client-side (chat, orquestrador) operam em camada separada do pipeline SSR

---

## Executive Engines

**Localização:** `features/samuel-ai/services/`

As Executive Engines são funções puras de build que transformam contexto e saídas anteriores em estruturas de decisão executiva. Executam exclusivamente no servidor, em sequência determinística.

### Pipeline SSR (ordem de execução)

| # | Engine | Função | Responsabilidade |
|---|---|---|---|
| 1 | Context | `buildExecutiveContext` | Carrega empresa, perfil e memórias do Supabase |
| 2 | Intelligence | `buildExecutiveIntelligence` | Sintetiza indicadores, riscos e oportunidades |
| 3 | Decisions | `buildExecutiveDecisions` | Gera decisões executivas priorizadas |
| 4 | Execution Planner | `buildExecutionPlan` | Converte decisões em planos de execução |
| 5 | Monitoring | `buildExecutiveMonitoring` | KPIs, alertas e progresso |
| 6 | Learning | `buildExecutiveLearning` | Padrões, insights e evolução |
| 7 | Forecast | `buildExecutiveForecast` | Cenários, riscos e oportunidades futuras |
| 8 | Competitor | `buildExecutiveCompetitor` | Análise competitiva e gaps de mercado |
| 9 | Strategy | `buildExecutiveStrategy` | Plano de crescimento e estratégia por área |
| 10 | Action | `buildExecutiveAction` | Ações concretas com ROI estimado |
| 11 | Priority | `buildExecutivePriority` | Agenda, tarefas e dependências |
| 12 | Recommendation | `buildExecutiveRecommendation` | Recomendações consolidadas |
| 13 | CEO | `buildExecutiveCEO` | Saúde da empresa e síntese executiva |

### Engines client-side (fora do pipeline SSR)

| Engine | Localização | Responsabilidade |
|---|---|---|
| Orchestrator | `executive-orchestrator.service.ts` | Simula consulta ao Conselho Executivo no chat |
| Conversation | `samuel-ai-shell.tsx` | Gerencia fluxo conversacional |
| Reasoning | `executive-reasoning.service.ts` | Hipóteses, evidências e conclusões |

---

## Executive Brain

**Localização:** `features/samuel-ai/executive-brain/`

O Executive Brain é a camada de apresentação e síntese executiva. Agrega outputs das engines em estruturas consumíveis pela UI.

### Componentes

- `buildExecutiveBriefing` — Briefing executivo diário (saudação, métricas, prioridades)
- `buildExecutiveBrain` / `buildExecutiveBrainFromSnapshot` — Montagem do cérebro completo
- `types.ts` — Tipos: `ExecutiveBrain`, `ExecutiveBriefing`, `ExecutiveStatus`, `ExecutiveCouncilMember`

### Seções do Dashboard Executivo

O `executive-dashboard.tsx` renderiza seções especializadas:

- Status, Briefing, Context, Council, Orchestrator
- Intelligence, Strategy, Action Plan, Execution Plan
- Monitoring, Forecast, Reasoning, Memory, CEO, Conversation

---

## Executive CEO

**Localização:** `features/samuel-ai/services/executive-ceo.service.ts`

A engine CEO é o ponto de síntese final do pipeline. Recebe outputs de todas as engines e módulos para produzir:

- `CompanyHealth` — Status geral da empresa (score, tendência, áreas críticas)
- Síntese executiva consolidada para o painel direito e Live Board
- Input para `buildExecutiveBriefing`

É a representação digital da visão do Presidente Executivo sobre o estado atual do negócio.

---

## Executive Modules

**Localização:** `features/{crm,marketing,sales,finance,operations,hr,legal,google-business,google-analytics,search-console,meta,linkedin}/`

Cada módulo segue o padrão:

```
build{Module}Executive()           → fallback com dados mock
build{Module}ExecutiveForCompany() → dados reais do Supabase/API
```

### Módulos de negócio

| Módulo | Serviço | Fonte de dados |
|---|---|---|
| CRM | `crm-executive.service.ts` | Supabase (contacts, leads, deals) |
| Marketing | `marketing-executive.service.ts` | Supabase (campaigns, reports) |
| Sales | `sales-executive.service.ts` | Supabase (deals, leads) |
| Finance | `finance-executive.service.ts` | Supabase (revenues, expenses) |
| Operations | `operations-executive.service.ts` | Supabase (tasks, reports) |
| HR | `hr-executive.service.ts` | Supabase (members, insights) |
| Legal | `legal-executive.service.ts` | Supabase (contracts, insights) |

### Módulos de integração

| Módulo | Serviço | Integração |
|---|---|---|
| Google Business | `google-business-executive.service.ts` | API Google Business Profile |
| Google Analytics | `google-analytics-executive.service.ts` | `integrations/google-analytics` |
| Search Console | `search-console-executive.service.ts` | `integrations/google-search-console` |
| Meta | `meta-executive.service.ts` | `integrations/meta` |
| LinkedIn | `linkedin-executive.service.ts` | Mock (integração futura) |

Os módulos recebem engines upstream (strategy, intelligence, forecast, competitor) e enriquecem o pipeline com dados de domínio específico.

---

## Executive Watchers

**Localização:** `features/watchers/`

Watchers são agentes de monitoramento proativo que observam sinais externos e internos continuamente.

### Watchers implementados

| Watcher | Provider | Dados | Enriquecimento |
|---|---|---|---|
| **Core** | `watcher-core.service.ts` | Mock executivo | Intelligence, memories |
| **Market** | `market-watcher.provider.ts` | Mock de mercado | Alert center, inbox, CEO |
| **SEO** | `seo-watcher.provider.ts` | Search Console real ou mock | Marketing, intelligence |

### Infraestrutura

- `watcher-bridge.service.ts` — Ponte entre watchers e engines
- `buildCombinedWatcherExecutive` — Agrega watchers no pipeline SSR
- `ExecutiveAlertCenter` — UI de alertas agregados
- Funções de enrich: `enrichIntelligenceWith*`, `enrichMemoriesWith*`, `enrichMarketingWith*`

---

## Executive Inbox

**Localização:** `features/executive-inbox/`

Centro de comando executivo — primeira seção exibida no Workspace.

- `executive-inbox.service.ts` — Constrói itens da inbox a partir de action, priority e monitoring
- `ExecutiveInbox`, `ExecutiveInboxCard`, `ExecutiveInboxFilters` — Componentes de UI
- `executive-inbox-persistence.service.ts` — Persistência (parcial)

---

## Camadas de Dados

### Supabase

- Schema em `supabase/migrations/`
- Context service: `services/executive-context.service.ts`
- Tabelas: companies, campaigns, deals, revenues, expenses, tasks, members, contracts, etc.

### Integrações

- `integrations/google-analytics/` — Adapter, client, mapper
- `integrations/google-search-console/` — Adapter
- `integrations/meta/` — Auth, adapter, mapper, types

---

## Estrutura de Diretórios

```
sf-growth-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Placeholder (teste Supabase)
│   └── samuel-ai/page.tsx          # Pipeline SSR principal
├── features/
│   ├── samuel-ai/                  # Núcleo executivo
│   │   ├── components/             # UI (workspace, dashboard, chat)
│   │   ├── executive-brain/        # Briefing e tipos do cérebro
│   │   └── services/               # 13 Executive Engines
│   ├── executive-inbox/            # Centro de comando
│   ├── executive-memory-engine/    # Memória executiva (parcial)
│   ├── executive-knowledge/        # Conhecimento executivo (parcial)
│   ├── watchers/                   # Monitoramento proativo
│   ├── crm/, marketing/, sales/    # Módulos de negócio
│   ├── finance/, operations/, hr/, legal/
│   └── google-*, meta/, linkedin/  # Integrações
├── integrations/                   # Adapters de APIs externas
├── services/                       # Serviços compartilhados
├── supabase/                       # Migrations e schema
└── docs/                           # Documentação complementar
```

---

## Visão Futura

As seções abaixo descrevem componentes arquiteturais planejados, ainda não integrados ao pipeline de produção.

### Company Brain

Camada unificada que representa a inteligência organizacional completa — integrando todas as engines, módulos, memória e conhecimento em um único grafo de decisão. Ver [COMPANY_BRAIN.md](./COMPANY_BRAIN.md).

**Status:** Especificado. Não integrado ao pipeline SSR.

### Executive Memory

**Localização atual:** `features/executive-memory-engine/`

Sistema de memória executiva com ciclo de vida, scoring e persistência:

- Memória curta (conversação), longa (decisões), de negócio (entidades), de aprendizagem e de relacionamento
- Serviços: lifecycle, score, storage, business, integration
- Integração futura com Company Brain e pipeline SSR

**Status:** Implementação parcial. Serviços definidos; integração ao pipeline pendente.

### Executive Knowledge

**Localização atual:** `features/executive-knowledge/`

Base de conhecimento executivo com playbooks, eventos de aprendizagem e retrieval:

- Registro, avaliação e busca de conhecimento
- Playbooks por domínio executivo
- AI Provider abstraction (`noop-ai-provider.ts` como placeholder)

**Status:** Implementação parcial. Sem provider de IA real.

### Executive Wisdom

Camada de sabedoria acumulada — padrões de longo prazo, princípios derivados de experiência e heurísticas validadas por resultados.

- Derivada de Executive Memory + Executive Knowledge + Learning Engine
- Capacidade de generalizar aprendizados entre empresas (anonimizado)
- Tomada de decisão baseada em experiência histórica, não apenas dados atuais

**Status:** Planejado. Sem implementação.

### AI Provider Layer

Camada de abstração para provedores de IA (LLMs):

- Interface unificada em `features/executive-knowledge/providers/ai-provider.types.ts`
- Implementação atual: `noop-ai-provider.ts` (sem chamadas reais)
- Futuro: OpenAI, Anthropic, modelos locais, roteamento por tarefa

**Status:** Interface definida. Provider real pendente.

### Software Factory

Capacidade do Samuel AI de identificar oportunidades de software, gerar especificações, arquitetura e código, coordenar agentes e implantar soluções. Ver [SOFTWARE_FACTORY.md](./SOFTWARE_FACTORY.md).

**Status:** Visão documentada. Sem implementação.

---

## Princípios Arquiteturais

1. **SSR-first** — Pipeline executivo roda no servidor; cliente recebe dados prontos
2. **Engines puras** — Funções de build sem side effects; testáveis e composáveis
3. **Fallback gracioso** — Toda engine e módulo tem fallback mock quando dados reais falham
4. **Enrichment em cascata** — Integrações e watchers enriquecem engines upstream
5. **Separação SSR/client** — Pipeline de decisão no servidor; interação conversacional no cliente
6. **Feature-based** — Cada domínio em `features/` com services, components e types próprios

---

## Documentos Relacionados

- [VISION.md](./VISION.md) — Visão estratégica
- [ROADMAP.md](./ROADMAP.md) — Fases de evolução
- [COMPANY_BRAIN.md](./COMPANY_BRAIN.md) — Cérebro organizacional
- [SOFTWARE_FACTORY.md](./SOFTWARE_FACTORY.md) — Fábrica de software
- `docs/03-architecture/SF_GROWTH_AI_ARCHITECTURE_V1.md` — Arquitetura V1 detalhada
- `docs/SAMUEL_AI_EXECUTIVE_BRAIN.md` — Pipeline de decisão do Samuel AI
- `PROJECT_REVIEW.md` — Revisão de gaps e status atual
