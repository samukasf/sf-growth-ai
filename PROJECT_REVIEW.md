# SF Growth AI — Product Review & Gap Analysis

**Sprint 43** · Revisão completa antes da próxima fase  
**Data:** Julho 2026  
**Escopo:** Análise apenas — sem alterações de funcionalidade ou arquitetura

---

## Resumo executivo

O produto hoje é essencialmente **uma rota comercial** (`/samuel-ai`) com um **Executive Workspace** modular, abrindo por padrão na **Executive Inbox**. O pipeline server-side (Supabase → engines → módulos → CEO) está **estruturalmente completo** e alimenta a maior parte da UI. Porém, várias camadas ainda operam em **modo demonstração**: briefing fixo, conselho mock, chat sem LLM real, market watcher 100% mock, ações da inbox sem persistência, e dezenas de painéis escondidos atrás de um `<details>` colapsado.

**Veredito:** protótipo executivo avançado, pronto para demo com dados reais parciais — **não** pronto para venda comercial sem fechar gaps de persistência, IA real, onboarding e rotas de produto.

---

## 1. Telas existentes

| Rota / Tela | Arquivo | Status | Observação |
|-------------|---------|--------|------------|
| `/` | `app/page.tsx` | Placeholder | Teste de conexão Supabase; não é produto |
| `/samuel-ai` | `app/samuel-ai/page.tsx` | **Tela principal** | Executive Workspace completo |
| Auth, Onboarding, Business, Dashboard, Diagnostic, Growth Score | `features/*/index.ts` | Stub vazio | `export {}` — zero implementação |

### Seções do Executive Workspace (19 itens de navegação)

| Seção | Grupo | Status |
|-------|-------|--------|
| **Executive Inbox** | Núcleo | Parcial — UI completa; ações locais |
| **Dashboard** | Núcleo | Parcial — mix mock + real |
| **Samuel AI** | Núcleo | Parcial — UX rica; orquestração simulada |
| Executive Alerts | Executivo | Funcional |
| Executive Timeline | Executivo | Funcional |
| Executive Agenda | Executivo | Funcional |
| Executive Tasks | Executivo | Funcional |
| Executive Watchers | Executivo | Parcial — market mock |
| Marketing, Sales, Finance, Operations, HR, Legal | Módulos | Parcial — Supabase + fallback mock |
| Google Business, GA, Search Console, Meta, LinkedIn | Integrações | Parcial — API com fallback mock |

**Ausente na navegação:** CRM (dados existem, UI só no painel colapsado).

---

## 2. Executive Engines

Pipeline em `app/samuel-ai/page.tsx` → props → `SamuelAiShell` → `ExecutiveWorkspace` / `ExecutiveInbox`.

| Engine | Build function | No page.tsx | Chega à UI | Status |
|--------|----------------|-------------|------------|--------|
| Context | `buildExecutiveContext` | ✅ | Briefing, intelligence, chat | **Funcional** — Supabase |
| Intelligence | `buildExecutiveIntelligence` | ✅ | Dashboard, Inbox, Timeline | **Funcional/partial** |
| Decisions | `buildExecutiveDecisions` | ✅ | Tasks, Inbox, Dashboard | **Funcional** |
| Execution Planner | `buildExecutionPlan` | ✅ | Agenda, Dashboard | **Funcional** |
| Monitoring | `buildExecutiveMonitoring` | ✅ | Agenda, Alerts, Inbox | **Funcional** |
| Learning | `buildExecutiveLearning` | ✅ | Dashboard colapsado | **Partial** — heurística |
| Forecast | `buildExecutiveForecast` | ✅ | Dashboard colapsado | **Partial** — heurística |
| Competitor | `buildExecutiveCompetitor` | ✅ | Indireto (engines) | **Mock** — sem UI |
| Strategy | `buildExecutiveStrategy` | ✅ | Dashboard, Timeline | **Funcional** |
| Action | `buildExecutiveAction` | ✅ | Executive Inbox | **Funcional** |
| Priority | `buildExecutivePriority` | ✅ | Executive Inbox | **Funcional** |
| Recommendation | `buildExecutiveRecommendation` | ✅ | Tasks, Inbox, Timeline | **Funcional** |
| CEO | `buildExecutiveCEO` | ✅ | Right panel, Live Board | **Funcional** |

### Engines fora do pipeline SSR (caminho client/chat)

| Engine | Onde roda | Status |
|--------|-----------|--------|
| Orchestrator | `samuel-ai-shell.tsx` | **Simulado** — fases com delay 450ms |
| Conversation | `samuel-ai-shell.tsx` | **Partial** — templates, não LLM |
| Reasoning | Via conversation | **Partial** — painel colapsado |

### Serviços definidos mas subutilizados

| Serviço | Problema |
|---------|----------|
| `buildExecutiveBrain` / `runExecutiveOrchestration` | Exportados; shell usa `buildExecutiveBrainFromSnapshot` |
| `features/samuel-ai/services/index.ts` | Barrel sem imports externos |
| `buildQueryExecutiveContext` (deprecated) | Alias não usado pelo page |
| `mock-executives.ts` | Só orquestrador UI |

---

## 3. Executive Modules

Padrão universal: `build*ExecutiveForCompany(companyId)` com fallback para `build*Executive()` + `MOCK_*`.

| Módulo | Fonte de dados | Nav Workspace | API real |
|--------|----------------|---------------|----------|
| CRM | Supabase contacts/leads/deals | ❌ Sem aba | Parcial |
| Marketing | Supabase campaigns + reports | ✅ | Parcial |
| Sales | Supabase deals/leads | ✅ | Parcial |
| Finance | Supabase revenues/expenses | ✅ | Parcial |
| Operations | Supabase tasks/reports | ✅ | Parcial |
| HR | Supabase members/insights | ✅ | Parcial |
| Legal | Supabase contracts/insights | ✅ | Parcial |
| Google Business | API + adapter | ✅ | ✅ com fallback |
| Google Analytics | `integrations/google-analytics` | ✅ | ✅ com fallback |
| Search Console | `integrations/google-search-console` | ✅ | ✅ com fallback |
| Meta | `integrations/meta` | ✅ | ✅ com fallback |
| LinkedIn | `MOCK_METRICS` apenas | ✅ | ❌ Sem integração |

---

## 4. Watchers

| Watcher | Dados | Integração | UI |
|---------|-------|------------|-----|
| **Core** (`watcher-core.service`) | `MOCK_EXECUTIVE_WATCHERS` | page.tsx → intelligence/memories | Executive Watchers, right panel |
| **Market** | `fetchMarketWatcherMockData` | page.tsx → alert center, inbox, CEO | MarketWatcherSection |
| **SEO** | Search Console real OU mock | page.tsx → marketing enrichment | SeoWatcherSection |
| **Alert Center** | Agregador mixed | Alerts nav + Inbox service | ExecutiveAlertCenter |

---

## 5. Componentes visuais

### Visíveis na navegação principal

- `ExecutiveInbox`, `ExecutiveAlertCenter`, `ExecutiveTimeline`
- `ExecutiveExperience`, `ChatPanel`, `ExecutiveLiveBoard`
- `ExecutiveBriefingSection`, `ExecutiveCouncilSection`, `ExecutiveIntelligenceSection`
- `ExecutiveDecisionsSection`, `ExecutiveExecutionPlanSection`, `ExecutiveMonitoringSection`
- `ExecutiveWatchersSection`, `MarketWatcherSection`, `SeoWatcherSection`
- 11× `*ExecutiveSummarySection` (módulos + integrações)
- `ExecutiveSidebar`, `ExecutiveWorkspaceRightPanel`
- Shared: `CommandPanel`, `SectionHeader`, `StatusBadge`

### Nunca aparecem para o usuário típico

| Componente | Motivo |
|------------|--------|
| `CrmExecutiveSummarySection` | Só em `<details>` colapsado; sem nav CRM |
| `ExecutiveConversationSection` | Substituído por `ChatPanel` |
| `ExecutiveStatusSection` | Só painel colapsado |
| `ExecutiveOrchestratorSection` | Só painel colapsado |
| `ExecutiveReasoningSection` | Só painel colapsado |
| `ExecutiveCeoSection` | Parcial no right panel; seção completa colapsada |
| `ExecutiveLearningSection` | Só painel colapsado |
| `ExecutiveForecastSection` | Só painel colapsado |
| `ExecutiveStrategySection` | Só painel colapsado |
| `ExecutiveMemorySection` | Só painel colapsado |
| `ExecutiveContextSection` | Só painel colapsado |
| `ExecutiveActionPlanSection` | Só painel colapsado |
| `FieldList` | Só via Context colapsado |
| Features auth/onboarding/diagnostic/etc. | Stubs vazios |

O `ExecutiveDashboard` completo (25+ painéis) está **enterrado** em “Painéis completos do Command Center” no Dashboard, colapsado por padrão.

---

## 6. Executive Workspace

| Aspecto | Status |
|---------|--------|
| Layout (sidebar + center + right panel) | ✅ Funcional |
| 19 seções de navegação | ✅ Funcional |
| Default: Executive Inbox | ✅ Configurado |
| Mobile menu | ✅ Funcional |
| Badge “Demonstração” | Visível — indica modo demo |
| Persistência de estado entre seções | ❌ Ações inbox/alertas só em memória client |

---

## 7. Executive Inbox

| Aspecto | Status |
|---------|--------|
| Consolidação automática (8 fontes) | ✅ Funcional |
| KPIs (Pendências, Urgentes, Resolvidas, Score) | ✅ Funcional |
| 15 filtros/categorias | ✅ Funcional |
| Campos por item (título, origem, prioridade, etc.) | ✅ Funcional |
| Ações rápidas (Abrir, Delegar, Resolver, Arquivar, Executar) | ⚠️ **Cosméticas** — `statusOverrides` local |
| Deep-link para seção de origem | ❌ Não implementado |
| Persistência Supabase | ❌ Não implementado |

**Fontes consolidadas:** Alerts, Recommendations, Priorities, Watchers, Actions, Decisions, Timeline, CEO.

---

## 8. Samuel AI

| Aspecto | Status |
|---------|--------|
| Chat UI (`ChatPanel`) | ✅ Funcional |
| Mensagem inicial | Mock (`MOCK_CHAT_MESSAGES`) |
| Resposta ao enviar | Template via `buildExecutiveConversation` / `buildSamuelCeoResponse` |
| Orquestração visual (6 fases) | Simulada — 450ms por fase |
| LLM externo (OpenAI/Anthropic) | ❌ Não conectado |
| `ExecutiveExperience` | Condicional — só após análise ativa |
| Consenso + recomendações | Funcional quando análise roda |

---

## 9. Dashboard

| Painel visível | Fonte | Status |
|----------------|-------|--------|
| Executive Briefing | `MOCK_EXECUTIVE_BRIEFING` (“Café Aroma”) | **Mock** |
| Executive Live Board | brainStatus + orchestrator + CEO | **Funcional** |
| Executive Council | `MOCK_EXECUTIVE_COUNCIL` | **Mock** |
| Executive Intelligence | `buildExecutiveIntelligence` | **Funcional** (vazio sem company) |
| Command Center completo | Todos os engines + módulos | **Funcional mas oculto** (`<details>`) |

**Gap crítico:** briefing e conselho não refletem a empresa carregada do Supabase.

---

## 10. Timeline

| Aspecto | Status |
|---------|--------|
| 14 etapas do pipeline | ✅ Funcional |
| Atualização live (200ms) durante processamento | ✅ Funcional |
| Seção dedicada + embed em Samuel AI | ✅ Visível |
| Conteúdo das etapas | Derivado/sintético — não telemetria real |
| Integração com Inbox | ✅ Steps viram itens |

---

## Respostas consolidadas

### O que realmente está funcional?

- Rota `/samuel-ai` com Executive Workspace completo
- Pipeline SSR: context → intelligence → decisions → plans → monitoring → strategy → action → priority → recommendation → CEO
- Módulos executivos com `*ForCompany` quando há dados Supabase
- Integrações GA, GSC, Meta, Google Business (com tokens configurados)
- Executive Alerts (agregação real de múltiplas fontes)
- Executive Inbox (consolidação automática de 8 fontes)
- Executive Timeline (visualização de fases)
- Executive Agenda / Tasks (decisions, plans, monitoring)
- Right panel (scores CEO, watchers, alertas recentes)
- SEO Watcher (quando Search Console conectado)

### O que está parcialmente implementado?

- Dashboard (briefing/council mock + intelligence real)
- Samuel AI chat (UX completa, IA simulada)
- Executive Inbox ações (UI sem backend)
- Alert Center ações (mesmo padrão local)
- Módulos (live quando DB populado; mock quando vazio)
- SEO Watcher (real OU mock)
- Learning, Forecast (heurísticas sem histórico)
- Executive Experience (condicional à análise)

### O que ainda depende de mock?

- `MOCK_EXECUTIVE_BRIEFING`, `MOCK_EXECUTIVE_COUNCIL`, `MOCK_EXECUTIVE_STATUS`
- `MOCK_CHAT_MESSAGES`, `MOCK_EXECUTIVES`, `DEFAULT_EXECUTIVE_BRAIN`
- Core Watchers (`MOCK_EXECUTIVE_WATCHERS`)
- Market Watcher (`fetchMarketWatcherMockData`)
- Competitor Intelligence (`MOCK_COMPETITORS`)
- LinkedIn Executive (sempre mock)
- Fallbacks em todos os `build*Executive()` quando DB/API falha
- Orquestrador client (fases simuladas, opiniões canned)

### O que já pode ser conectado a APIs reais?

| Integração | Pronto para API | Requisito |
|------------|-----------------|-----------|
| Google Analytics | ✅ | `GOOGLE_ANALYTICS_ACCESS_TOKEN`, property ID |
| Search Console | ✅ | Token + site URL |
| Meta | ✅ | Page token OAuth |
| Google Business | ✅ | Business Profile API credentials |
| Supabase (todos módulos) | ✅ | Dados nas tabelas (contacts, deals, campaigns, etc.) |
| SEO Watcher | ✅ | Via Search Console executive |
| LLM (chat) | ⚠️ Arquitetura pronta | Falta provider + route API |
| Market data | ❌ | Sem provider real |
| LinkedIn | ❌ | Sem client/integration |
| Competitor intel | ❌ | Sem fonte externa |

### Quais telas estão incompletas?

1. `/` — não é produto
2. Auth, Onboarding, Business, Diagnostic, Growth Score — stubs
3. CRM — sem seção workspace
4. Competitor — sem UI
5. Dashboard briefing/council — desconectados da empresa real
6. Executive Inbox — sem persistência de workflow

### Quais componentes nunca aparecem para o usuário?

- 12+ seções do `ExecutiveDashboard` (colapsadas por padrão)
- `CrmExecutiveSummarySection` (sem nav)
- `ExecutiveConversationSection` (supersedido)
- `FieldList`, features stubs (auth, onboarding, etc.)
- `buildExecutiveBrain` path (código morto)

### Quais serviços nunca são utilizados?

- `buildExecutiveBrain`, `runExecutiveOrchestration`, `runExecutiveOrchestrationToBrain`
- Barrel `features/samuel-ai/services/index.ts` (sem consumidores)
- `buildQueryExecutiveContext` (deprecated alias)

### Quais arquivos estão duplicados / padrões repetidos?

| Padrão | Localizações |
|--------|--------------|
| Watcher bridges (enrich memories/intelligence) | `watcher-bridge.service.ts`, `market-watcher.bridge.ts`, `seo-watcher.bridge.ts` |
| Market/SEO watcher services | `market-watcher.service.ts`, `seo-watcher.service.ts` |
| Alert Center vs Inbox UI | `executive-alert-center/`, `executive-inbox/components/` |
| Timeline (3 sistemas) | `timeline-steps.tsx`, `executive-timeline/`, `ExecutiveLiveBoard` |
| `MetricTile` inline | GA, Google Business, Search Console sections |
| `buildExecutiveSummary` (nome) | `executive-context.service.ts` vs `executive-ceo.service.ts` |
| Command Center vs Workspace | `executive-dashboard.tsx` vs `ExecutiveWorkspaceCenter.tsx` |
| Alert cards (3 variantes) | WatchersSection inline, AlertCard, right panel list |

---

## Melhorias visuais prioritárias

1. **Remover ou contextualizar badge “Demonstração”** quando dados reais estiverem ativos
2. **Briefing e Council dinâmicos** — usar nome/scores da empresa carregada
3. **Promover Command Center** — não esconder 25 painéis em `<details>`
4. **CRM na sidebar** — paridade com outros módulos
5. **Inbox → deep-link** para seção de origem do item
6. **Feedback visual** nas ações da inbox (toast, confirmação, estado persistido)
7. **Unificar timeline** — um sistema visual, não três
8. **MetricTile compartilhado** nos módulos Google
9. **Empty states** quando Supabase sem company (hoje mistura mock silencioso)
10. **Mobile:** right panel como drawer, não bloco no fim da página

---

## TOP 20 prioridades para produto comercial

| # | Prioridade | Impacto | Esforço |
|---|------------|---------|---------|
| 1 | **Autenticação + multi-tenant** (auth stub → login, company por usuário) | Crítico | Alto |
| 2 | **Onboarding** (cadastro empresa, conectar integrações) | Crítico | Alto |
| 3 | **LLM real no Samuel AI** (API route + streaming + contexto executivo) | Crítico | Médio |
| 4 | **Persistência Inbox/Alerts** (status, delegação, arquivo no Supabase) | Crítico | Médio |
| 5 | **Briefing/Council dinâmicos** (eliminar mock “Café Aroma”) | Alto | Baixo |
| 6 | **CRM na navegação** + seção workspace dedicada | Alto | Baixo |
| 7 | **Home/landing comercial** (substituir `/` teste Supabase) | Alto | Médio |
| 8 | **Empty state explícito** vs fallback mock silencioso | Alto | Médio |
| 9 | **Market Watcher API real** (substituir mock provider) | Alto | Alto |
| 10 | **LinkedIn integration** (`ForCompany` + API client) | Alto | Alto |
| 11 | **Competitor Intelligence UI** + fonte de dados real | Alto | Alto |
| 12 | **Promover painéis do Command Center** (nav ou dashboard expandido) | Médio | Baixo |
| 13 | **Workflow Inbox** (delegar → criar task, executar → action plan) | Alto | Médio |
| 14 | **Histórico de chat** persistido por empresa | Médio | Médio |
| 15 | **Configuração integrações self-service** (OAuth flows na UI) | Alto | Alto |
| 16 | **Unificar bridges watchers** (reduzir duplicação, manutenção) | Médio | Médio |
| 17 | **Remover código morto** (`buildExecutiveBrain` path, barrels não usados) | Baixo | Baixo |
| 18 | **Growth Score + Diagnostic** (features stub → MVP) | Médio | Alto |
| 19 | **Notificações** (alertas críticos inbox → email/push) | Médio | Médio |
| 20 | **Billing/planos** (limites por integração, seats, API usage) | Crítico (receita) | Alto |

---

## Mapa de maturidade por área

```
Funcional ████████████░░░░░░░░  ~60%
Parcial   ████████░░░░░░░░░░░░  ~35%
Mock/Stub ████░░░░░░░░░░░░░░░░  ~15% (mas visível ao usuário em demo)
```

| Área | Maturidade |
|------|------------|
| Executive Workspace shell | ████████░░ 80% |
| SSR Engine pipeline | ███████░░░ 70% |
| Executive Inbox | ██████░░░░ 60% |
| Module executives | ██████░░░░ 60% |
| Integrações Google/Meta | █████░░░░░ 50% |
| Watchers | ████░░░░░░ 40% |
| Samuel AI chat | ███░░░░░░░ 30% |
| Auth / Onboarding / Billing | ░░░░░░░░░░ 0% |

---

## Arquivos-chave referenciados

| Área | Path |
|------|------|
| Pipeline SSR | `app/samuel-ai/page.tsx` |
| Workspace | `features/samuel-ai/components/executive-workspace/` |
| Inbox | `features/executive-inbox/` |
| Engines | `features/samuel-ai/services/` |
| Watchers | `features/watchers/` |
| Integrações | `integrations/` |
| Mocks | `features/samuel-ai/executive-brain/mock-data.ts` |
| Nav | `features/samuel-ai/components/executive-workspace/workspace-navigation.ts` |

---

*Relatório gerado na Sprint 43 — análise estática do codebase, sem alterações funcionais.*
