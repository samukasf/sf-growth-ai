# Relatório Técnico Completo — SF Growth AI

> **Versão do relatório:** 1.0  
> **Data:** 14 de julho de 2026  
> **Versão do projeto:** 0.1.0  
> **Stack:** Next.js 16.2.9 · React 19 · TypeScript 5 · Tailwind CSS 4 · Supabase · Vitest 3.2.4  
> **Autor:** Gerado a partir de análise estática do repositório e execução de build/lint/test

---

# PART 1 — Visão Geral, Estrutura, Tecnologias e Arquitetura

---

## 1. Visão Geral

### 1.1 Objetivo do sistema

O **SF Growth AI** é uma plataforma de **inteligência executiva para pequenas e médias empresas (PMEs)**. Não é um CRM tradicional nem um chatbot genérico: o produto posiciona-se como um **Conselho Executivo Digital** liderado por **Samuel AI™**, capaz de:

- Compreender o contexto organizacional de cada empresa
- Monitorar sinais de mercado, SEO e operações
- Priorizar decisões, alertas e ações executivas
- Consultar especialistas digitais (Financeiro, Marketing, Vendas, Operações, RH, Jurídico, CRM)
- Executar ferramentas reais (Gmail, Calendar, Contacts, Drive, Supabase) via linguagem natural
- Evoluir de assistente reativo para sistema proativo com memória, aprendizagem e automação

A missão está documentada em `VISION.md`: democratizar inteligência executiva para empresários que constroem a economia real, com foco em **faturamento, lucro, eficiência e crescimento sustentável**.

### 1.2 Arquitetura geral

O sistema adota uma arquitetura em camadas com separação clara entre **produto (features/app)**, **domínio (core)** e **infraestrutura (integrations/lib/supabase)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APRESENTAÇÃO                         │
│  app/ (Next.js App Router)  ·  features/*/components  ·  components/ │
│  Rotas: /samuel-ai (produto) · /samuel (runtime) · /debug/* (dev)      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE ORQUESTRAÇÃO / SERVIÇOS                  │
│  features/samuel-runtime        → Pipeline Samuel (11 fases)          │
│  features/samuel-ai/services    → 13 Executive Engines (SSR)          │
│  services/executive-context     → Contexto da empresa (Supabase)      │
│  app/api/*                      → 5 endpoints HTTP                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE DOMÍNIO (core/)                       │
│  executive-council · enterprise-brain-runtime · ai-provider           │
│  executive-orchestrator · executive-crm · commerce · organization · …   │
│  Padrão hexagonal: domain / application / infrastructure / shared       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CAMADA DE INTEGRAÇÃO E PERSISTÊNCIA                  │
│  integrations/ (Gmail, GA, GSC, Meta)  ·  lib/supabase/               │
│  supabase/migrations/ (PostgreSQL + RLS)  ·  APIs externas Google/Meta  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Dois caminhos de execução coexistem:**

| Caminho | Rota | Descrição |
|---------|------|-----------|
| **Executive Workspace (SSR)** | `/samuel-ai` | Pipeline server-side com 13 engines + 12 módulos + watchers; UI rica; chat **simulado** no shell client |
| **Samuel Runtime (API)** | `/samuel` + `POST /api/samuel/runtime` | Pipeline completo com Intent Router, Company Brain, Council, Tools, AI Gateway; **caminho real de IA** |

### 1.3 Fluxo principal do Samuel

O fluxo canônico do Samuel está implementado em `features/samuel-runtime/samuel-runtime.service.ts` e exposto via `POST /api/samuel/runtime`:

```
Usuário envia query
        │
        ▼
┌───────────────────┐
│ Execution Memory  │  (wrapper — persiste ao final; não altera resposta)
│   wrapper         │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 1. Intent Router  │  Classificação determinística (pt-BR rules)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 2. Goal Planner   │  Plano multi-step heurístico (observabilidade)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 3. Conversation   │  Leitura do histórico in-process
│    Memory (read)  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 4–6. Orchestrator │  Memória, contexto, action plan (heurístico legado)
│ + Memory + Context│
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 7. Company Brain  │  Snapshot: prioridades, riscos, oportunidades
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 8–9. Executive    │  Especialistas → consenso → decisão
│     Council       │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 10. Tool Planning │  Multi-Tool OU single Tool Planner
│  → Orchestrator   │  Gmail, Calendar, Contacts, Drive, Supabase, mocks
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 11. Response      │  Tool Interpreter → AI Gateway → narrativa final
│  + Conv. Memory   │  Grava turno na Conversation Memory
│    (write)        │
└─────────┬─────────┘
          ▼
    RuntimeResponse JSON
```

**Princípio de design:** Samuel nunca chama ferramentas diretamente. A linguagem natural é interpretada pelo **Tool Planner** / **Multi-Tool Task Orchestrator**, que delegam ao **Tool Orchestrator** (agnóstico ao Samuel).

---

## 2. Estrutura completa do projeto

### 2.1 Árvore de diretórios (principais pastas)

```
sf-growth-ai/
├── app/                          # Next.js App Router — rotas e API
│   ├── page.tsx                  # / — placeholder Supabase
│   ├── layout.tsx                # Layout raiz (pt-BR, Geist fonts)
│   ├── samuel-ai/page.tsx        # Produto principal — Executive Workspace
│   ├── samuel/page.tsx           # UI do Samuel Runtime
│   ├── debug/                    # Ferramentas de desenvolvimento
│   │   ├── company-brain/
│   │   ├── gmail-connect/
│   │   └── samuel-playground/
│   └── api/
│       ├── samuel/runtime/
│       ├── company-brain/build/
│       └── integrations/gmail/{connect,callback,inbox}/
│
├── apps/web/src/core/company-brain/  # Company Brain alternativo (com testes)
│
├── blueprint/                    # Documentação estratégica (00–18 + pilots)
├── docs/                         # Documentação técnica oficial
├── specs/                        # Especificações funcionais por módulo
├── project/                      # Sprint, backlog, known issues, changelog
│
├── core/                         # ~24 módulos de domínio (hexagonal/DDD)
│   ├── ai-provider/
│   ├── executive-council/
│   ├── enterprise-brain-runtime/
│   ├── executive-orchestrator/
│   ├── executive-crm/ … executive-wisdom/
│   ├── commerce/ organization/ software-factory/ …
│   └── (cada um: domain/ application/ infrastructure/ shared/)
│
├── features/                     # ~33 módulos de produto
│   ├── samuel-ai/                # Executive Workspace (UI principal)
│   ├── samuel-runtime/           # Pipeline Samuel
│   ├── samuel-intent-router/
│   ├── samuel-goal-planner/
│   ├── samuel-conversation-memory/
│   ├── samuel-execution-memory/
│   ├── samuel-tool-orchestrator/
│   ├── samuel-tool-interpreter/
│   ├── samuel-multi-tool-task-orchestrator/
│   ├── samuel-playground/
│   ├── google-calendar/ google-contacts/ google-drive/
│   ├── crm/ marketing/ sales/ finance/ operations/ hr/ legal/
│   ├── google-business/ google-analytics/ search-console/ meta/ linkedin/
│   ├── watchers/ executive-inbox/ executive-memory-engine/
│   └── auth/ onboarding/ dashboard/ diagnostic/ growth-score/ (stubs)
│
├── components/                   # UI compartilhada (layout, forms, ui)
├── integrations/                 # Adaptadores de APIs externas
│   ├── gmail/
│   ├── google-analytics/
│   ├── google-search-console/
│   └── meta/
│
├── lib/supabase/                 # client.ts, service-client.ts
├── services/                     # executive-context, executive-memory
├── supabase/migrations/          # 9 migrations SQL
├── types/ utils/ constants/ config/ styles/ hooks/ public/
│
└── Arquivos raiz: package.json, tsconfig.json, vitest.config.ts,
    eslint.config.mjs, ROADMAP.md, VISION.md, ARCHITECTURE.md, …
```

**Escala aproximada:** ~2.000+ arquivos rastreados; `core/` ~1.570 arquivos; `features/` ~315 arquivos.

### 2.2 Principais módulos

| Módulo | Caminho | Função |
|--------|---------|--------|
| **Samuel AI (Workspace)** | `features/samuel-ai/` | Interface executiva com 19 seções de navegação |
| **Samuel Runtime** | `features/samuel-runtime/` | Orquestrador do pipeline de 11 fases |
| **Intent Router** | `features/samuel-intent-router/` | Classificação de intenção (sem IA) |
| **Goal Planner** | `features/samuel-goal-planner/` | Planejamento heurístico de objetivos |
| **Conversation Memory** | `features/samuel-conversation-memory/` | Memória de sessão in-process |
| **Execution Memory** | `features/samuel-execution-memory/` | Auditoria persistente em Supabase |
| **Tool Orchestrator** | `features/samuel-tool-orchestrator/` | Execução de ferramentas registradas |
| **Tool Interpreter** | `features/samuel-tool-interpreter/` | Tradução de output de tools para LLM |
| **Multi-Tool Orchestrator** | `features/samuel-multi-tool-task-orchestrator/` | Workflows multi-step |
| **Company Brain** | `core/enterprise-brain-runtime/` | Snapshot organizacional |
| **Executive Council** | `core/executive-council/` | Deliberação multi-especialista |
| **AI Gateway** | `core/ai-provider/` | Roteamento multi-provider LLM |
| **Gmail OAuth** | `integrations/gmail/` | OAuth unificado Google Workspace |

### 2.3 Responsabilidade de cada pasta

| Pasta | Responsabilidade |
|-------|------------------|
| `app/` | Rotas Next.js, layouts, route handlers HTTP |
| `features/` | Lógica de produto: UI, serviços executivos, runtime Samuel |
| `core/` | Domínio puro: entidades, use cases, ports, adapters |
| `integrations/` | Clientes HTTP para APIs de terceiros |
| `components/` | Componentes React reutilizáveis (design system parcial) |
| `services/` | Orquestração app-level (contexto executivo da empresa) |
| `lib/` | Infraestrutura compartilhada (Supabase clients) |
| `supabase/` | Schema PostgreSQL, migrations, config local |
| `blueprint/` | Visão estratégica de longo prazo (referência, sem código) |
| `docs/` | Documentação técnica e arquitetural |
| `specs/` | Contratos funcionais por feature |
| `project/` | Gestão de sprint, backlog, issues conhecidas |
| `apps/web/` | Sub-app com Company Brain alternativo e testes |

---

## 3. Tecnologias utilizadas

### 3.1 Frameworks

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16.2.9 | Framework full-stack, App Router, SSR, API routes |
| **React** | 19.2.4 | UI declarativa, Client/Server Components |
| **TypeScript** | 5.x | Tipagem estática em todo o projeto |
| **Tailwind CSS** | 4.x | Estilização utility-first via PostCSS |
| **Vitest** | 3.2.4 | Testes unitários |

### 3.2 Bibliotecas

| Biblioteca | Uso |
|------------|-----|
| `@supabase/ssr` / `@supabase/supabase-js` | Cliente Supabase (browser + server) |
| `jszip` | Manipulação de arquivos ZIP (Google Drive) |
| `mammoth` | Extração de texto DOCX |
| `pdfjs-dist` | Leitura de PDF |
| `xlsx` | Planilhas Excel |
| `pdf-lib` (dev) | Geração de PDF em testes |

### 3.3 Banco de dados

| Componente | Detalhe |
|------------|---------|
| **PostgreSQL** | Via Supabase hosted |
| **Extensão vector** | Migration 005 — embeddings 1536 dims em `ai_memory` |
| **RLS** | Row Level Security em tabelas multi-tenant (migration 006) |
| **9 migrations** | Schema completo CRM + Finance + Marketing + AI + OAuth |

### 3.4 APIs externas

| API | Base URL | Integração |
|-----|----------|------------|
| Gmail API | `gmail.googleapis.com` | OAuth + tools Samuel |
| Google Calendar API | `www.googleapis.com/calendar/v3` | Tool Samuel |
| Google People API | `people.googleapis.com` | Contacts tool |
| Google Drive API | `www.googleapis.com/drive/v3` | Drive tool |
| Google OAuth | `accounts.google.com`, `oauth2.googleapis.com` | Fluxo unificado |
| Google Analytics Data API | Via `integrations/google-analytics` | Token env-based |
| Google Search Console API | Via `integrations/google-search-console` | Token env-based |
| Google Business Profile | Via `features/google-business` | Token env-based |
| Meta Graph API | Via `integrations/meta` | Token env-based |
| OpenAI API | Via `core/ai-provider` | AI Gateway |
| Anthropic API | Via `core/ai-provider` | AI Gateway |
| Google Gemini API | Via `core/ai-provider` | AI Gateway |
| DeepSeek API | Via `core/ai-provider` | AI Gateway |
| Grok/xAI API | Via `core/ai-provider` | AI Gateway |
| Ollama | Local `localhost:11434` | AI Gateway (dev) |

### 3.5 Ferramentas de desenvolvimento

| Ferramenta | Configuração |
|------------|--------------|
| ESLint 9 | `eslint.config.mjs` — `eslint-config-next` |
| TypeScript | `tsconfig.json` — strict, path alias `@/*` |
| PostCSS | `postcss.config.mjs` — Tailwind 4 |
| Vitest | `vitest.config.ts` — node env, paths `@` |

### 3.6 Serviços externos

| Serviço | Finalidade |
|---------|------------|
| **Supabase** | Auth, PostgreSQL, RLS, storage futuro |
| **Google Cloud Console** | OAuth Client ID, APIs Gmail/Calendar/People/Drive |
| **Vercel** (planejado) | Deploy — ainda não configurado |
| **Provedores LLM** | OpenAI, Anthropic, Gemini, DeepSeek, Grok, Ollama |

---

## 4. Arquitetura — Interação dos componentes

### 4.1 Samuel Runtime

**Arquivo:** `features/samuel-runtime/samuel-runtime.service.ts`  
**Export principal:** `runSamuelRuntime(input: RunSamuelRuntimeInput): Promise<RuntimeResponse>`

Responsabilidades:
- Orquestrar as 11 fases do pipeline com observabilidade (`pipeline[]`, `durationMs`)
- Aplicar kill-switches via variáveis de ambiente
- Coordenar todos os subsistemas sem acoplamento direto às tools
- Produzir `RuntimeResponse` estruturado para UI, API e Execution Memory

### 4.2 Intent Router

**Módulo:** `features/samuel-intent-router/`  
**Entrada:** `classifyIntent(query, language?)`  
**Saída:** `{ category, confidence, justification }`

Categorias: `BUSINESS`, `GENERAL_KNOWLEDGE`, `HYBRID`, `AUTOMATION`, `ANALYSIS`, `CREATION`

- **Sem IA**, **sem tools**, **sem side effects**
- Regras determinísticas em `languages/pt-br.rules.ts`
- Primeira fase obrigatória do pipeline

### 4.3 Goal Planner

**Módulo:** `features/samuel-goal-planner/`  
**Implementação:** `HeuristicGoalPlanner`

- Gera plano multi-step a partir da categoria de intent
- Atualmente **somente observabilidade** — fases downstream não dependem do plano
- Kill-switch: `SAMUEL_GOAL_PLANNER_ENABLED=false`

### 4.4 Company Brain

**Módulo:** `core/enterprise-brain-runtime/`  
**Factory:** `createEnterpriseBrainRuntime()`  
**Método principal:** `buildSnapshot(organizationId, companyId)`

Agrega dados de adapters (CRM, memória, conhecimento) e produz snapshot com:
- `priorities`, `risks`, `opportunities`, `confidence`, `organizationSummary`

Kill-switch de dados reais: `COMPANY_BRAIN_REAL_DATA_SOURCES_ENABLED=false` → adapters simulados

### 4.5 Executive Council

**Módulo:** `core/executive-council/`  
**Factory:** `createExecutiveCouncil()`  
**Método:** `process(input)` → opinions, conflicts, consensus, decision, recommendations

Especialistas: CEO, Finance, Marketing, Sales, Operations, HR, Legal, CRM

- Com IA: `EXECUTIVE_COUNCIL_AI_ENABLED !== "false"` → `ai-council-specialist.adapter.ts`
- Sem IA: especialistas heurísticos (`DEFAULT_COUNCIL_SPECIALISTS`)

### 4.6 Tool Planner

**Arquivo:** `features/samuel-runtime/tool-planner.ts`  
**Não exportado** publicamente — interno ao runtime

Detectores regex/heurísticos para: calculator, date-time, uuid, json-formatter, supabase-query, gmail, google-calendar, google-contacts, google-drive

Retorna `ToolPlan`: `{ selected: false }` ou `{ selected: true, toolName, input, reason }`

### 4.7 Tool Orchestrator

**Módulo:** `features/samuel-tool-orchestrator/`  
**Factory:** `createToolOrchestrator()`  
**Método:** `execute(toolName, input, context)` → `ToolResult`

- **Nunca lança exceção** — sempre retorna `{ status: success|error }`
- **Agnóstico ao Samuel** — tools não conhecem linguagem natural
- Registry imutável com `DEFAULT_TOOLS` (9 tools)

### 4.8 Multi-Tool Task Orchestrator

**Módulo:** `features/samuel-multi-tool-task-orchestrator/`  
**Planner:** `planMultiToolTask(query)`  
**Executor:** `MultiToolTaskOrchestrator.execute(plan, context)`

Padrão suportado: *"Agende reunião com X e envie convite por e-mail"*  
Steps: `google-contacts` → `google-calendar` → `gmail` (com dependências)

Kill-switch: `SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED=false`  
Tem prioridade sobre Tool Planner single-tool.

### 4.9 Tool Interpreter

**Módulo:** `features/samuel-tool-interpreter/`  
**Funções:** `interpretToolResult()`, `interpretMultiToolTaskResults()`

Converte output bruto de tools em:
- `contextForAi` — injetado no prompt do AI Gateway
- `humanFallback` — prefixo legível quando Gateway falha

Kill-switch: `SAMUEL_TOOL_INTERPRETER_ENABLED=false`

### 4.10 AI Gateway

**Core:** `core/ai-provider/` — `createAIProvider()`, `AIProviderService.executeRequest()`  
**Adapter Samuel:** `features/samuel-runtime/ai-gateway-narrative.adapter.ts` — `generateNarrativeViaAIGateway()`

Providers com fallback automático: OpenAI, Anthropic, Gemini, DeepSeek, Grok, Ollama

Kill-switch: `SAMUEL_AI_GATEWAY_ENABLED=false`  
Timeout: 8 segundos; fallback para narrativa heurística do Council/Orchestrator

### 4.11 Conversation Memory

**Módulo:** `features/samuel-conversation-memory/`  
**Store:** `InMemoryConversationMemoryStore` (singleton in-process)

Armazena por `conversationId`:
- Mensagens, auto-summary (>12 msgs → resume 6 + summary)
- Entidades extraídas, objetivo ativo, último intent/tool

**Não persiste em banco** — memória de sessão apenas.

### 4.12 Execution Memory

**Módulo:** `features/samuel-execution-memory/`  
**Wrapper:** `runSamuelRuntimeWithExecutionMemory()`  
**Persistência:** tabela `samuel_execution_memory` (Supabase)

Registra: tokens, custo estimado, tools, decisão, narrativa final, tempo de execução  
**Nunca altera a resposta** — falhas de persistência são silenciosas.

### 4.13 Diagrama textual do fluxo completo

```
┌─────────────┐     POST JSON      ┌─────────────────────────────┐
│   Cliente   │ ─────────────────► │ /api/samuel/runtime         │
│ (UI/Debug)  │                    │ route.ts                    │
└─────────────┘                    └──────────────┬──────────────┘
                                                │
                    ┌───────────────────────────▼───────────────────────────┐
                    │ runSamuelRuntimeWithExecutionMemory()                  │
                    │  ├─ resolveExecutionUserId()                          │
                    │  └─ runSamuelRuntime() ─────────────────────────────┐   │
                    └──────────────────────────────────────────────────│───┘
                                                                       │
     ┌─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────┐   ┌────────────┐   ┌─────────────────────┐
│Intent      │──►│Goal        │──►│Conversation Memory  │
│Router      │   │Planner     │   │(read)               │
└────────────┘   └────────────┘   └──────────┬──────────┘
                                             │
     ┌───────────────────────────────────────┘
     ▼
┌────────────────┐   ┌──────────┐   ┌──────────────┐
│Executive       │──►│Memory    │──►│Context       │
│Orchestrator    │   │(view)    │   │(fields)      │
└────────────────┘   └──────────┘   └──────┬───────┘
                                          │
     ┌────────────────────────────────────┘
     ▼
┌────────────────┐   ┌──────────────────────────────┐
│Company Brain   │──►│Executive Council             │
│buildSnapshot() │   │process() → consensus/decision │
└────────────────┘   └──────────────┬───────────────┘
                                    │
     ┌──────────────────────────────┘
     ▼
┌─────────────────────────────────────────────────────────────┐
│ TOOLING PHASE                                               │
│  IF multi-tool enabled AND pattern matches:                 │
│    planMultiToolTask() → MultiToolTaskOrchestrator.execute()│
│  ELSE IF single tool detected:                              │
│    ToolPlanner.plan() → ToolOrchestrator.execute()          │
│  ELSE: tooling.attempted = false                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
     ┌─────────────────────────┘
     ▼
┌────────────────┐   ┌──────────────┐   ┌─────────────────────┐
│Tool            │──►│AI Gateway    │──►│Conversation Memory  │
│Interpreter     │   │(narrative)   │   │(write turn)         │
└────────────────┘   └──────────────┘   └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ RuntimeResponse JSON  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ saveExecutionMemory │
                    │ → Supabase          │
                    └─────────────────────┘
```

---

## 5. Funcionalidades concluídas

### 5.1 Samuel AI — Runtime e Inteligência

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Pipeline 11 fases | ✅ Completo | `samuel-runtime.service.ts` |
| Intent Router (pt-BR) | ✅ Completo | 6 categorias, regras determinísticas |
| Goal Planner heurístico | ✅ Completo | Observabilidade; kill-switch |
| Conversation Memory | ✅ Completo | In-process; summarizer + entity extractor |
| Execution Memory | ✅ Completo | Supabase `samuel_execution_memory` |
| Tool Calling (9 tools) | ✅ Completo | Mocks + Supabase + Google suite |
| Multi-Tool Orchestrator | ✅ Parcial | Fluxo reunião+email implementado |
| Tool Interpreter | ✅ Completo | Contexto para LLM por tool |
| AI Gateway integrado | ✅ Completo | Multi-provider com fallback |
| Samuel Playground | ✅ Completo | `/debug/samuel-playground` — inspector |
| UI Samuel Runtime | ✅ Completo | `/samuel` — chat com pipeline real |

### 5.2 Executive Workspace (`/samuel-ai`)

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| SSR Pipeline 13 engines | ✅ Completo | `app/samuel-ai/page.tsx` |
| 19 seções de navegação | ✅ Completo | Executive Workspace shell |
| Executive Inbox | ✅ UI completa | Ações locais (sem persistência) |
| Executive Alerts/Timeline/Agenda/Tasks | ✅ Funcional | Dados de engines |
| Dashboard executivo | ⚠️ Parcial | Mix mock + real |
| Chat Samuel (shell) | ⚠️ Simulado | Sem LLM; delay 450ms/fase |
| 12 módulos de negócio | ⚠️ Parcial | Supabase + fallback mock |
| Watchers (Core/Market/SEO) | ⚠️ Parcial | Market 100% mock; SEO real/mock |
| Badge "Demonstração" | ✅ Visível | Indica modo demo |

### 5.3 Google Workspace (OAuth unificado — Sprint 86)

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| OAuth Google unificado | ✅ Completo | Gmail + Calendar + Contacts + Drive |
| Tabela `google_oauth_connections` | ✅ Completo | Tokens por company_id |
| Gmail Tool | ✅ Completo | inbox, search, read, reply |
| Google Calendar Tool | ✅ Completo | CRUD eventos, availability |
| Google Contacts Tool | ✅ Completo | search, email, phone, company, birthdays |
| Google Drive Tool | ✅ Completo | search, read docs, download/extract |
| Debug Gmail Connect | ✅ Completo | `/debug/gmail-connect` |
| API inbox test | ✅ Completo | `GET /api/integrations/gmail/inbox` |

### 5.4 Integrações analíticas

| Integração | Status | Detalhes |
|------------|--------|----------|
| Google Analytics | ⚠️ Parcial | Client real; token via env; fallback mock |
| Google Search Console | ⚠️ Parcial | Client real; token via env; fallback mock |
| Google Business Profile | ⚠️ Parcial | Client real; token via env; fallback mock |
| Meta (Facebook/Instagram) | ⚠️ Parcial | Client + adapter; token via env; fallback mock |
| LinkedIn | ❌ Mock only | `MOCK_METRICS` — sem API real |

### 5.5 Domínio (core/)

| Módulo | Status |
|--------|--------|
| AI Provider Layer | ✅ Implementado com 6 providers |
| Executive Council | ✅ Heurístico + IA opcional |
| Enterprise Brain Runtime | ✅ Snapshot + adapters Supabase/simulados |
| Executive Orchestrator | ✅ Use cases + noop adapters |
| Executive CRM/Knowledge/Learning/Wisdom | ✅ Estrutura DDD; parcialmente conectado |
| Commerce, Organization, Software Factory | ✅ Domínio modelado; UI não exposta |
| 44 noop adapters | ✅ Permitem compilação sem backends reais |

### 5.6 Banco de dados

| Funcionalidade | Status |
|----------------|--------|
| Schema multi-tenant (companies) | ✅ 9 migrations |
| CRM (contacts, leads, deals, activities) | ✅ |
| Finance (8 tabelas) | ✅ |
| Marketing (campaigns, ad_sets, ads) | ✅ |
| Growth AI (reports, insights, memory, tasks) | ✅ |
| Auth RLS (user_profiles, policies) | ✅ |
| Dashboard views (4 views SQL) | ✅ |
| Samuel execution memory | ✅ |
| Google OAuth connections | ✅ |

### 5.7 Ferramentas utilitárias (Tools)

| Tool | Tipo | Status |
|------|------|--------|
| calculator | Mock | ✅ |
| date-time | Mock | ✅ |
| uuid | Mock | ✅ |
| json-formatter | Mock | ✅ |
| supabase-query | Real | ✅ CRM/revenue queries |
| gmail | Real | ✅ |
| google-calendar | Real | ✅ |
| google-contacts | Real | ✅ |
| google-drive | Real | ✅ |

### 5.8 Testes

| Área | Arquivos de teste | Casos |
|------|-------------------|-------|
| Samuel Runtime + tools | 20+ | ~150 |
| Google integrations | 9 | ~60 |
| Company Brain | 4 | ~30 |
| Executive Council | 3 | ~25 |
| AI Provider | 1 | ~15 |
| **Total** | **59 arquivos** | **367 casos** (363 pass, 2 fail, 2 skip) |

---

# PART 2 — Pendências, Banco de Dados, APIs, Autenticação e Variáveis

---

## 6. Funcionalidades pendentes

### 6.1 Prioridade ALTA (bloqueiam produto comercial)

| Item | Dependências | Descrição |
|------|--------------|-----------|
| **AI Provider no chat do Workspace** | API keys configuradas; unificar `/samuel` runtime com shell | Chat em `/samuel-ai` ainda simulado |
| **Persistência Executive Inbox** | Schema inbox + API CRUD | Ações são cosméticas (`statusOverrides` local) |
| **Autenticação de produto** | Supabase Auth UI + rotas protegidas | `features/auth/` é stub vazio |
| **Onboarding** | Auth + Company Brain discovery | `features/onboarding/` stub |
| **Deploy produção** | Vercel/CI + env secrets | Não configurado (KI-003) |
| **RLS em tabelas sensíveis** | Migration follow-up | `samuel_execution_memory`, `google_oauth_connections` sem policies user-facing |
| **Contratos de API documentados** | DT-003 | Endpoints sem OpenAPI/spec formal |

### 6.2 Prioridade MÉDIA (valor incremental)

| Item | Dependências | Descrição |
|------|--------------|-----------|
| **CRM na navegação Workspace** | UI já existe (colapsada) | Dados Supabase prontos |
| **Market Watcher dados reais** | API de mercado/notícias | 100% mock hoje |
| **LinkedIn integration** | LinkedIn API credentials | Apenas mock metrics |
| **Company Brain no pipeline SSR** | Fase 2 roadmap | Runtime tem; Workspace SSR não |
| **Executive Memory persistente** | Schema + lifecycle | In-process apenas no runtime |
| **Goal Planner influenciar downstream** | Refator pipeline | Hoje só observabilidade |
| **Multi-tool patterns adicionais** | Tool registry | Só fluxo reunião+email |
| **Corrigir 2 testes falhando** | PDF timeout em drive tests | `drive-binary-extractor.test.ts`, `drive-tool.test.ts` |

### 6.3 Prioridade BAIXA (roadmap longo prazo)

| Item | Fase ROADMAP | Descrição |
|------|--------------|-----------|
| AI Software Factory | Fase 5 | `core/software-factory/` modelado, não exposto |
| Enterprise OS | Fase 6 | Visão 2027+ |
| Growth Score Engine | Fase 4 | `features/growth-score/` stub |
| Diagnostic routes | — | Stub |
| Design System centralizado | DT-002 | Tokens não unificados |
| Documentação legada | KI-001 | Duplicação em `docs/00-master/` |

### 6.4 Mapa de dependências

```
Auth + Onboarding
    └── Company selection (company_members)
            └── Executive Context (SSR)
                    └── Workspace com dados reais
                            └── Inbox persistência
                                    └── Ações executáveis end-to-end

Google OAuth (✅ feito)
    └── Tools Samuel (✅ feito)
            └── Multi-tool workflows (parcial)
                    └── Automações proativas (futuro)

AI Provider Layer (✅ feito no runtime)
    └── Conectar ao ChatPanel do Workspace
            └── Executive Council IA em produção
                    └── Company Brain consulta real
```

---

## 7. Banco de dados

### 7.1 Migrations

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 001 | `20260701130938_001_initial_schema.sql` | companies, company_members, executive_brains, business_twins, contacts |
| 002 | `20260701133000_002_crm.sql` | leads, deals, activities |
| 003 | `20260701140000_003_finance.sql` | bank_accounts, invoices, expenses, revenues, transactions, budgets, recurring_payments, financial_reports |
| 004 | `20260701150000_004_marketing_growth.sql` | marketing_campaigns, ad_sets, ads |
| 005 | `20260701160000_005_growth_ai.sql` | growth_reports, ai_insights, ai_memory (vector), ai_tasks |
| 006 | `20260701170000_006_auth_rls.sql` | user_profiles, RLS policies, `current_company()` |
| 007 | `20260701180000_007_dashboard_views.sql` | 4 views agregadas |
| 008 | `20260701190000_008_samuel_execution_memory.sql` | samuel_execution_memory |
| 009 | `20260712000000_009_google_oauth_connections.sql` | google_oauth_connections |

### 7.2 Tabelas — finalidade e relacionamentos

#### Organização

| Tabela | Finalidade | FK principal |
|--------|------------|--------------|
| `companies` | Tenant raiz — cada empresa cliente | — |
| `company_members` | Usuários ↔ empresas com role | → companies, auth.users |
| `user_profiles` | Perfil estendido pós-auth | → auth.users, companies |
| `executive_brains` | Personalidades executivas por empresa | → companies |
| `business_twins` | Representação digital 1:1 da empresa | → companies (UNIQUE) |

#### CRM

| Tabela | Finalidade | FK |
|--------|------------|-----|
| `contacts` | Contatos comerciais | → companies |
| `leads` | Pipeline de leads | → companies, contacts |
| `deals` | Oportunidades de venda | → companies, leads |
| `activities` | Tarefas/interações CRM | → companies, contacts/leads/deals |

#### Financeiro

| Tabela | Finalidade |
|--------|------------|
| `bank_accounts` | Contas bancárias |
| `invoices` | Faturas emitidas |
| `expenses` | Despesas |
| `revenues` | Receitas |
| `transactions` | Movimentações consolidadas |
| `budgets` | Orçamentos por categoria/período |
| `recurring_payments` | Pagamentos recorrentes |
| `financial_reports` | Relatórios gerados (jsonb + ai_summary) |

#### Marketing

| Tabela | Finalidade |
|--------|------------|
| `marketing_campaigns` | Campanhas multi-plataforma |
| `ad_sets` | Conjuntos de anúncios |
| `ads` | Anúncios individuais com métricas |

#### Growth AI

| Tabela | Finalidade |
|--------|------------|
| `growth_reports` | Scores diários por dimensão |
| `ai_insights` | Insights gerados por executive brains |
| `ai_memory` | Memória vetorial (embedding 1536) |
| `ai_tasks` | Tarefas derivadas de insights |

#### Samuel + OAuth

| Tabela | Finalidade | Notas |
|--------|------------|-------|
| `samuel_execution_memory` | Log de execuções do runtime | organization_id/company_id como text (sem FK) |
| `google_oauth_connections` | Tokens OAuth Google por empresa | RLS ativo, zero policies — service role only |

#### Views

| View | Agrega |
|------|--------|
| `dashboard_companies` | Contatos, deals, invoices, expenses por empresa |
| `dashboard_finance` | Totais income/expense |
| `dashboard_marketing` | Budget, spend, revenue, ROI |
| `dashboard_sales` | Pipeline e deals ganhos |

### 7.3 Diagrama ER simplificado

```
auth.users ──┬── user_profiles ──► companies ◄── company_members
             │                         │
             │                         ├── executive_brains
             │                         ├── business_twins (1:1)
             │                         ├── contacts ── leads ── deals
             │                         ├── activities
             │                         ├── bank_accounts ── transactions
             │                         ├── invoices / expenses / revenues
             │                         ├── marketing_campaigns ── ad_sets ── ads
             │                         ├── growth_reports / ai_insights
             │                         ├── ai_memory (vector) / ai_tasks
             │                         ├── samuel_execution_memory
             │                         └── google_oauth_connections
```

### 7.4 RLS — estado atual

| Com RLS + policies | Sem policies (service role / aberto) |
|--------------------|--------------------------------------|
| user_profiles, companies, contacts, leads, deals, activities | company_members, executive_brains, business_twins |
| bank_accounts, invoices, expenses, transactions | revenues, budgets, financial_reports |
| recurring_payments, marketing_campaigns, ad_sets, ads | growth_reports, ai_insights, ai_memory, ai_tasks |
| google_oauth_connections (deny all user roles) | samuel_execution_memory |

---

## 8. APIs

### 8.1 APIs internas (Next.js Route Handlers)

| Método | Endpoint | Finalidade | Auth | Status |
|--------|----------|------------|------|--------|
| POST | `/api/samuel/runtime` | Executa pipeline Samuel completo | Bearer JWT opcional; fallback userId em dev | ✅ Produção-ready |
| POST | `/api/company-brain/build` | Constrói Company Brain de payload discovery | Nenhuma explícita | ✅ Funcional |
| GET | `/api/integrations/gmail/connect` | Inicia OAuth Google (`?companyId=uuid`) | Nenhuma (risco CSRF documentado) | ✅ Funcional |
| GET | `/api/integrations/gmail/callback` | Callback OAuth; persiste tokens | State HMAC | ✅ Funcional |
| GET | `/api/integrations/gmail/inbox` | Teste inbox real (`?companyId=uuid`) | Service role interno | ✅ Funcional |

### 8.2 APIs externas consumidas

#### Google Workspace (OAuth unificado)

| API | Finalidade | Autenticação | Status integração |
|-----|------------|--------------|-------------------|
| Gmail API v1 | Inbox, drafts, send, reply | OAuth2 refresh token por company | ✅ Real via Samuel tools |
| Calendar API v3 | Eventos, free/busy | Mesmo token OAuth | ✅ Real via Samuel tools |
| People API v1 | Contatos | Mesmo token OAuth | ✅ Real via Samuel tools |
| Drive API v3 | Arquivos, export, download | Mesmo token OAuth | ✅ Real via Samuel tools |
| OAuth2 | Authorize + token exchange | Client ID/Secret | ✅ Real |

#### Google Analytics / Search Console / Business

| API | Finalidade | Autenticação | Status |
|-----|------------|--------------|--------|
| GA Data API | Métricas de tráfego | `GOOGLE_ANALYTICS_ACCESS_TOKEN` env | ⚠️ Token estático; fallback mock |
| Search Console API | SEO performance | `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN` env | ⚠️ Token estático; fallback mock |
| Business Profile API | Reviews, insights locais | `GOOGLE_BUSINESS_ACCESS_TOKEN` env | ⚠️ Token estático; fallback mock |

#### Meta

| API | Finalidade | Autenticação | Status |
|-----|------------|--------------|--------|
| Graph API | Pages, Ads, Instagram | `META_ACCESS_TOKEN` env | ⚠️ Token estático; fallback mock |
| OAuth Meta (preparado) | `meta.auth.ts` scopes definidos | `META_APP_ID/SECRET` | ⚠️ Código pronto; fluxo UI incompleto |

#### Provedores LLM (AI Gateway)

| Provider | Finalidade | Autenticação | Status |
|----------|------------|--------------|--------|
| OpenAI | Narrativa + Council IA | `OPENAI_API_KEY` | ✅ Integrado com fallback |
| Anthropic | Narrativa + Council IA | `ANTHROPIC_API_KEY` | ✅ Integrado |
| Google Gemini | Narrativa + Council IA | `GEMINI_API_KEY` | ✅ Integrado |
| DeepSeek | Narrativa | `DEEPSEEK_API_KEY` | ✅ Integrado |
| Grok/xAI | Narrativa | `GROK_API_KEY` | ✅ Integrado |
| Ollama | Dev local | Sem chave; `OLLAMA_BASE_URL` | ✅ Integrado |

#### Supabase

| API | Finalidade | Autenticação | Status |
|-----|------------|--------------|--------|
| PostgREST | CRUD multi-tenant | Anon key + RLS / Service role | ✅ Primário |
| Auth | Sign-up/sign-in | JWT | ⚠️ Infra pronta; UI auth stub |

---

## 9. Autenticação

### 9.1 OAuth Google (Gmail + Calendar + Contacts + Drive)

**Arquivos principais:**
- `integrations/gmail/gmail.auth.ts` — URLs, scopes, HMAC state
- `integrations/gmail/gmail.client.ts` — Gmail API + `completeGmailOAuthConnection()`
- `integrations/gmail/gmail-token.repository.ts` — CRUD Supabase
- `lib/supabase/service-client.ts` — Service role (bypass RLS)

**Fluxo:**

1. `GET /api/integrations/gmail/connect?companyId=<uuid>`
2. Redirect para Google com scopes: `gmail.readonly`, `gmail.compose`, `gmail.send`, `calendar`, `contacts.readonly`, `drive.readonly`
3. `state` = base64url(`{companyId}`) + HMAC-SHA256(client_secret)
4. Callback troca `code` por tokens; upsert em `google_oauth_connections`
5. `resolveGmailAccessToken(companyId)` auto-refresh quando expirado

**Segurança:**
- Tabela `google_oauth_connections`: RLS ON, zero policies → apenas service role
- State HMAC previne associação arbitrária de companyId
- Limitação conhecida: sem nonce de sessão (CSRF parcial) — aceitável para ferramenta interna

### 9.2 Supabase Auth

**Infraestrutura:**
- `auth.users` (Supabase managed)
- `user_profiles` com trigger `on_auth_user_created`
- `company_members` para multi-tenancy
- `current_company()` function para RLS
- Clients: `lib/supabase/client.ts` (anon), `lib/supabase/service-client.ts` (service role)

**Estado atual:**
- Migration 006 define RLS policies por `company_id`
- `features/auth/` é **stub vazio** (`export {}`)
- Nenhuma rota de login/signup no App Router
- `resolveExecutionUserId()` aceita Bearer JWT ou fallback `userId` em `NODE_ENV !== 'production'`

### 9.3 AI Providers

**Módulo:** `core/ai-provider/`

- Factory registra todos os providers disponíveis via `DefaultAIProviderFactory`
- `DefaultAIProviderSelector` escolhe provider por disponibilidade, preferência e health
- Fallback automático se provider falha ou sem API key
- Samuel acessa via adapter (`ai-gateway-narrative.adapter.ts`), nunca diretamente
- Executive Council acessa via `ai-council-specialist.adapter.ts`

**Kill-switches:**
- `SAMUEL_AI_GATEWAY_ENABLED=false`
- `EXECUTIVE_COUNCIL_AI_ENABLED=false`
- `SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER=openai|anthropic|...`
- `EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER=...`

---

## 10. Variáveis de ambiente

### 10.1 Supabase

| Variável | Exemplo mascarado | Finalidade | Obrigatória |
|----------|-------------------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://*****.supabase.co` | URL pública do projeto | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...****` | Chave anon (browser + RLS) | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...****` | Chave server-only; OAuth secrets | Sim (para Google OAuth) |

### 10.2 Google OAuth

| Variável | Exemplo mascarado | Finalidade | Obrigatória |
|----------|-------------------|------------|-------------|
| `GOOGLE_CLIENT_ID` | `123456789-****.apps.googleusercontent.com` | OAuth Client ID | Sim (para tools Google) |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-****` | OAuth secret + HMAC state | Sim |
| `GOOGLE_OAUTH_REDIRECT_URI` | `http://localhost:3000/api/integrations/gmail/callback` | Redirect URI registrada | Sim |

### 10.3 Samuel kill-switches (default: habilitado)

| Variável | Finalidade |
|----------|------------|
| `SAMUEL_TOOL_CALLING_ENABLED` | Master switch de tool calling |
| `SAMUEL_SUPABASE_QUERY_TOOL_ENABLED` | Tool queries CRM/revenue |
| `SAMUEL_GMAIL_TOOL_ENABLED` | Tool Gmail |
| `SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED` | Tool Calendar |
| `SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED` | Tool Contacts |
| `SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED` | Tool Drive |
| `SAMUEL_TOOL_INTERPRETER_ENABLED` | Interpretação de resultados para LLM |
| `SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED` | Workflows multi-step |
| `SAMUEL_CONVERSATION_MEMORY_ENABLED` | Memória de sessão |
| `SAMUEL_GOAL_PLANNER_ENABLED` | Planejamento de objetivos |
| `SAMUEL_EXECUTION_MEMORY_ENABLED` | Persistência de auditoria |
| `SAMUEL_AI_GATEWAY_ENABLED` | Narrativa via LLM |
| `COMPANY_BRAIN_REAL_DATA_SOURCES_ENABLED` | Dados reais vs simulados no Brain |

### 10.4 AI Gateway

| Variável | Default | Finalidade |
|----------|---------|------------|
| `OPENAI_API_KEY` | — | Chave OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modelo default |
| `ANTHROPIC_API_KEY` | — | Chave Anthropic |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-latest` | Modelo default |
| `GEMINI_API_KEY` | — | Chave Google Gemini |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Modelo default |
| `DEEPSEEK_API_KEY` | — | Chave DeepSeek |
| `DEEPSEEK_MODEL` | `deepseek-chat` | Modelo default |
| `GROK_API_KEY` | — | Chave xAI Grok |
| `GROK_MODEL` | `grok-2-latest` | Modelo default |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | URL Ollama local |
| `OLLAMA_MODEL` | `llama3.1` | Modelo Ollama |
| `OLLAMA_ENABLED` | `true` | Habilitar Ollama no selector |
| `SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER` | — | Provider preferido Samuel |
| `SAMUEL_AI_GATEWAY_OPERATION` | — | Operação: reason, analyze, etc. |
| `EXECUTIVE_COUNCIL_AI_ENABLED` | — | IA nos especialistas do Council |
| `EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER` | — | Provider preferido Council |

### 10.5 Integrações analíticas (não em .env.example — usadas no código)

| Variável | Finalidade |
|----------|------------|
| `GOOGLE_ANALYTICS_ACCESS_TOKEN` | Token GA Data API |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | Property ID default |
| `GOOGLE_ANALYTICS_PROPERTY_MAP` | JSON map company→property |
| `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN` | Token GSC |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | Site URL default |
| `GOOGLE_SEARCH_CONSOLE_SITE_MAP` | JSON map company→site |
| `GOOGLE_BUSINESS_ACCESS_TOKEN` | Token Business Profile |
| `GOOGLE_BUSINESS_LOCATION_NAME` | Location resource name |
| `GOOGLE_BUSINESS_ACCOUNT_NAME` | Account resource name |
| `GOOGLE_BUSINESS_LOCATION_MAP` | JSON map company→location |
| `META_ACCESS_TOKEN` | Token Graph API |
| `META_PAGE_ID` | Page ID default |
| `META_PAGE_MAP` | JSON map company→page |
| `META_AD_ACCOUNT_ID` | Ad account ID |
| `META_AD_ACCOUNT_MAP` | JSON map company→ad account |
| `META_INSTAGRAM_BUSINESS_ID` | Instagram business ID |
| `META_APP_ID` | OAuth Meta app ID |
| `META_APP_SECRET` | OAuth Meta secret |
| `META_OAUTH_REDIRECT_URI` | Redirect OAuth Meta |

### 10.6 Desenvolvimento / testes

| Variável | Finalidade |
|----------|------------|
| `NODE_ENV` | `production` desabilita fallback userId em Execution Memory |
| `RUN_GOOGLE_DRIVE_OPS_VALIDATION` | Habilita testes de integração real Drive |
| `COMPANY_ID` | Company ID para testes ops validation |

---

# PART 3 — Fluxo de Execução, Estado Atual, Cobertura, Dívida, Roadmap e Código-fonte

---

## 11. Fluxo de execução detalhado

### 11.1 Caminho A — Samuel Runtime (`POST /api/samuel/runtime`)

**Passo a passo quando o usuário envia uma pergunta:**

1. **HTTP Request** — Cliente envia `{ query, companyId?, conversationId?, organizationId? }` para `/api/samuel/runtime`.

2. **Resolução de contexto** (`app/api/samuel/runtime/route.ts`):
   - Se `companyId` fornecido → `buildExecutiveContext(companyId)` via Supabase
   - Senão → `getFirstCompany()` como fallback
   - Monta `companyName`, `companyContext`

3. **Execution Memory wrapper** (`runSamuelRuntimeWithExecutionMemory`):
   - Gera `executionId` UUID
   - Resolve `userId` via JWT Bearer ou fallback dev
   - Chama `runSamuelRuntime()` — erros são logados mas relançados

4. **Fase `intent`** — `classifyIntent(query)`:
   - Normaliza query
   - Aplica regras pt-BR
   - Retorna categoria + confidence (0–1)

5. **Fase `goal_planning`** — `createGoalPlanner().plan()`:
   - Se kill-switch off → plano vazio
   - Senão → steps com dependsOn, priority calibrada por confidence

6. **Fase `conversation_memory` (read)**:
   - `getConversationMemoryStore().get(conversationId)`
   - `renderConversationContext()` → texto para prompt

7. **Fases `orchestrator` / `memory` / `context`**:
   - `runExecutiveOrchestration(query, companyContext)` — heurístico legado
   - `createExecutiveOrchestrator().processRequest()` — side effect adicional
   - Extrai memory view e context fields

8. **Fase `company_brain`**:
   - `createEnterpriseBrainRuntime().buildSnapshot(orgId, companyId)`
   - Adapters Supabase ou simulados conforme kill-switch
   - Monta `RuntimeCompanyBrainView`

9. **Fases `executive_council` / `decision`**:
   - `createExecutiveCouncil().process({ query, risks, opportunities, priorities, brainSnapshotId })`
   - Coleta opiniões, detecta conflitos, consenso, decisão
   - Monta `RuntimeCouncilView` e `RuntimeDecisionView`

10. **Fase `tooling`**:
    - Se `SAMUEL_TOOL_CALLING_ENABLED=false` → skip
    - Tenta Multi-Tool: `planMultiToolTask(query)` → se match, executa steps sequenciais
    - Senão Single-Tool: `createToolPlanner().plan(query)` → `createToolOrchestrator().execute()`
    - Tools resolvem `companyId` para OAuth tokens ou Supabase queries

11. **Fase `response`**:
    - `interpretToolResult()` ou `interpretMultiToolTaskResults()` → contexto para IA
    - `generateNarrativeViaAIGateway()` com: query, brain data, council consensus, tool context, conversation context
    - Se Gateway null → fallback `councilResult.response` ou `generateOrchestratorResponse()`
    - Prefixa summary determinístico se Tool Interpreter desligado
    - `getConversationMemoryStore().recordTurn()` — grava turno

12. **Resposta** — `RuntimeResponse` JSON com: narrative, pipeline timings, intent, goalPlan, council, decision, tooling, aiGateway metadata, conversationMemory

13. **Persistência** — `saveExecutionMemory(record)` → Supabase (assíncrono, não bloqueante)

### 11.2 Caminho B — Executive Workspace Chat (`/samuel-ai`)

**Fluxo atual (diferente do Runtime):**

1. SSR em `app/samuel-ai/page.tsx` executa 13 engines + 12 módulos + watchers
2. Props passadas para `SamuelAiPage` → `ExecutiveWorkspace` → `SamuelAiShell`
3. Usuário digita no `ChatPanel` (client component)
4. `samuel-ai-shell.tsx` simula orquestração com delays de 450ms por fase
5. Resposta via `buildExecutiveConversation()` / `buildSamuelCeoResponse()` — **templates heurísticos, sem LLM**
6. `ExecutiveExperience` renderiza condicionalmente após "análise ativa"

**Gap crítico:** Os dois caminhos não estão unificados. O runtime real existe em `/samuel` mas o produto principal usa simulação.

---

## 12. Estado atual

### 12.1 Módulos em produção (funcionais com dados reais)

| Módulo | Evidência |
|--------|-----------|
| Samuel Runtime API | 363 testes passando; build OK |
| Google OAuth + 4 tools | Integração real testada |
| Supabase schema | 9 migrations aplicáveis |
| Executive Workspace SSR | Build gera `/samuel-ai` |
| AI Gateway | Multi-provider com fallback |
| Execution Memory | Persistência Supabase |
| Company Brain (runtime) | Snapshot com adapters |

### 12.2 Módulos experimentais

| Módulo | Local | Notas |
|--------|-------|-------|
| Samuel Playground | `/debug/samuel-playground` | Inspector de pipeline |
| Gmail Connect Debug | `/debug/gmail-connect` | OAuth + inbox tester |
| Company Brain Debug | `/debug/company-brain` | Builder manual |
| Multi-Tool Orchestrator | runtime only | Um padrão de workflow |
| Goal Planner | runtime only | Não influencia decisões |
| Ollama provider | dev local | Requer servidor local |

### 12.3 Código morto / subutilizado

| Item | Local | Problema |
|------|-------|----------|
| `buildQueryExecutiveContext` | deprecated alias | Não usado pelo page |
| `features/samuel-ai/services/index.ts` | barrel export | Zero imports externos |
| `buildExecutiveBrain` direto | services | Shell usa `buildExecutiveBrainFromSnapshot` |
| 30+ feature stubs | auth, onboarding, dashboard, etc. | `export {}` |
| Painéis colapsados | ExecutiveWorkspace | 15+ seções nunca visíveis por default |
| `mock-executives.ts` | samuel-ai | Só orquestrador UI simulado |
| 44 noop adapters | core/*/infrastructure | Compilação sem backend |

### 12.4 Mocks restantes

| Mock | Arquivo | Impacto |
|------|---------|---------|
| `MOCK_CHAT_MESSAGES` | `features/samuel-ai/mock-data.ts` | Mensagem inicial do chat |
| `MOCK_EXECUTIVES` | `mock-executives.ts` | Orquestrador visual |
| `MOCK_EXECUTIVE_BRIEFING` | executive-brain | Briefing "Café Aroma" fixo |
| `MOCK_EXECUTIVE_COUNCIL` | executive-brain | Council no dashboard |
| `MOCK_*` por módulo | crm, finance, marketing, etc. | Fallback quando Supabase vazio |
| `MOCK_TOOLS` | tool-orchestrator | 4 tools utilitárias (intencionais) |
| `fetchMarketWatcherMockData` | watchers | Market watcher 100% fake |
| `MOCK_METRICS` LinkedIn | linkedin-executive | Sem API |

### 12.5 Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Chat Workspace sem LLM | Alta | Unificar com `/api/samuel/runtime` |
| OAuth sem CSRF nonce | Média | Aceito para debug; revisar para produção |
| Service role key em servidor | Alta | Nunca expor ao client; audit imports |
| `samuel_execution_memory` sem RLS | Média | Migration follow-up planejada |
| Inbox ações não persistem | Alta | Schema + API CRUD |
| 2 testes PDF timeout | Baixa | Aumentar timeout ou mock pdf-lib |
| Deploy não configurado | Alta | CI/CD Vercel |
| Tokens GA/GSC/Meta via env estático | Média | Migrar para OAuth per-company |

---

## 13. Cobertura

### 13.1 Testes

| Métrica | Valor |
|---------|-------|
| Arquivos de teste | 59 (`*.test.ts`) |
| Casos totais | 367 |
| Passando | 363 |
| Falhando | 2 (PDF timeout — `drive-binary-extractor`, `drive-tool`) |
| Skipped | 2 |
| Duração | ~40s |
| Framework | Vitest 3.2.4 |
| E2E | Nenhum (Playwright/Cypress ausentes) |

**Áreas com cobertura forte:**
- Samuel Runtime (14 arquivos)
- Tool Orchestrator + Interpreter
- Google integrations (Gmail, Calendar, Contacts, Drive)
- Intent Router, Conversation Memory, Execution Memory
- Executive Council, AI Provider
- Company Brain (`apps/web/src/core/company-brain/`)

**Áreas sem cobertura:**
- Componentes React / UI
- `app/` routes e pages
- Executive Workspace services
- Watchers, módulos HR/Legal/Operations
- Migrations SQL

**Cobertura aproximada:** ~15–20% do codebase (estimativa — Vitest coverage report não configurado)

### 13.2 Lint

| Métrica | Valor |
|---------|-------|
| ESLint | 0 errors, **104 warnings** |
| Principais warnings | `@typescript-eslint/no-unused-vars` em imports não usados |
| Prettier | Não configurado |

### 13.3 Build

| Métrica | Valor |
|---------|-------|
| `npm run build` | ✅ Sucesso |
| Compilação | 21.7s |
| TypeScript check | 43s |
| Rotas geradas | 14 (5 API + 9 pages) |
| Next.js | 16.2.9 |

---

## 14. Dívida técnica

### 14.1 Registrada em `project/KNOWN_ISSUES.md`

| ID | Área | Descrição | Prioridade |
|----|------|-----------|------------|
| KI-001 | Docs | Documentação legada duplicada | Baixa |
| KI-002 | Git | `.next/` no working tree | Baixa |
| KI-003 | Deploy | Deploy não configurado | Média |
| DT-001 | Testes | Cobertura limitada a módulos existentes | Média |
| DT-002 | Design System | Tokens não centralizados | Baixa |
| DT-003 | Specs | Contratos API não documentados | Alta |

### 14.2 Dívida adicional identificada

| Item | Impacto |
|------|---------|
| Dois caminhos Samuel (SSR simulado vs Runtime real) | Confusão arquitetural; UX inconsistente |
| Conversation Memory in-process only | Perde contexto entre restarts/deploys |
| Goal Planner sem efeito downstream | Código morto funcional |
| `organization_id`/`company_id` como text em execution_memory | Sem integridade referencial |
| 44 noop adapters no core | Complexidade sem valor imediato |
| Painéis UI enterrados em `<details>` | UX degradada; features invisíveis |
| Tokens OAuth analíticos (GA/GSC/Meta) não per-company | Não escala multi-tenant |
| Variáveis de integração ausentes em `.env.example` | Onboarding de dev difícil |
| 104 warnings ESLint | Imports mortos; manutenção |
| Ausência de Prettier | Formatação inconsistente |
| Ausência de CI pipeline | Sem gate automático de qualidade |
| RLS incompleto em tabelas AI/finance | Risco de vazamento multi-tenant |

---

## 15. Roadmap — próximos épicos recomendados

### Épico 1: Unificação Samuel (Sprint imediato)

**Objetivo:** Um único caminho de IA para todo o produto.

- Conectar `ChatPanel` do Workspace a `POST /api/samuel/runtime`
- Remover simulação de 450ms no shell (usar pipeline real com SSE/streaming opcional)
- Manter observabilidade visual do playground

**Dependências:** Nenhuma bloqueante  
**Critério de done:** Chat em `/samuel-ai` usa LLM real com tools

### Épico 2: Auth + Onboarding (Sprint +1)

**Objetivo:** Produto acessível com multi-tenancy real.

- Implementar `features/auth/` com Supabase Auth (email/OAuth)
- Fluxo onboarding: criar empresa → company_members → redirect `/samuel-ai`
- Proteger rotas com middleware Next.js

**Dependências:** Supabase Auth já configurado  
**Critério de done:** Usuário novo cria conta e vê sua empresa

### Épico 3: Executive Inbox Persistente (Sprint +2)

**Objetivo:** Centro de comando com ações reais.

- Schema `executive_inbox_items` + status/actions
- API CRUD + sync com engines existentes
- Deep-link para seção de origem

**Dependências:** Auth + company context  
**Critério de done:** Ações Resolve/Archive/Delegate persistem

### Épico 4: Company Brain em Produção (Fase 2)

**Objetivo:** Inteligência organizacional unificada.

- Integrar Company Brain ao pipeline SSR do Workspace
- Executive Memory persistente (lifecycle, scoring)
- Dashboard de saúde do Brain

**Dependências:** Épico 1–3  
**Critério de done:** Samuel consulta Brain antes de cada resposta; memória entre sessões

### Épico 5: Integrações OAuth per-company (Sprint +3)

**Objetivo:** Escalar integrações analíticas.

- OAuth Meta + GA + GSC per company (padrão Google OAuth)
- Remover tokens estáticos de env
- LinkedIn API básica

**Dependências:** Auth + google_oauth_connections pattern  
**Critério de done:** Cada empresa conecta suas próprias contas

### Épico 6: Deploy + CI/CD

**Objetivo:** Ambiente de produção.

- Vercel deploy com env secrets
- GitHub Actions: lint + test + build gate
- Configurar coverage report Vitest

**Dependências:** Testes estáveis (fix 2 PDF timeouts)  
**Critério de done:** PR merge exige CI green; staging URL funcional

---

## 16. Código-fonte — arquivos principais

### 16.1 Entry points

#### `app/api/samuel/runtime/route.ts` — API HTTP do Samuel

```typescript
// Responsabilidade: receber query, resolver contexto da empresa,
// delegar ao wrapper de Execution Memory, retornar RuntimeResponse JSON.
export async function POST(request: Request) {
  const body = await request.json();
  const query = body.query?.trim();
  // ... resolve companyId, companyContext via Supabase
  const result = await runSamuelRuntimeWithExecutionMemory({
    query, companyId, organizationId, companyName, companyContext,
    conversationId: body.conversationId,
    authorizationHeader: request.headers.get("authorization"),
  });
  return NextResponse.json(result);
}
```

#### `app/samuel-ai/page.tsx` — Produto principal (SSR)

Responsabilidade: orquestrar ~50 imports de builders (13 engines + 12 módulos + watchers + integrações), carregar contexto Supabase, passar props para `SamuelAiPage`. É o **maior arquivo de composição** do projeto (~650 linhas).

#### `features/samuel-runtime/samuel-runtime.service.ts` — Coração do Samuel

Responsabilidade: pipeline de 11 fases, kill-switches, coordenação de todos os subsistemas. Export: `runSamuelRuntime()`.

Trecho representativo — definição do pipeline:

```typescript
const PIPELINE_DEFINITION = [
  { id: "intent", label: "Intent Router" },
  { id: "goal_planning", label: "Goal Planner" },
  { id: "conversation_memory", label: "Conversation Memory" },
  { id: "orchestrator", label: "Samuel Orchestrator" },
  { id: "memory", label: "Memory" },
  { id: "context", label: "Context" },
  { id: "company_brain", label: "Company Brain" },
  { id: "executive_council", label: "Executive Council" },
  { id: "decision", label: "Decision" },
  { id: "tooling", label: "Tool Planning" },
  { id: "response", label: "Response" },
];
```

### 16.2 Componentes de inteligência

#### `features/samuel-intent-router/intent-router.ts`

Classificação determinística de intenção. Sem IA. Primeira fase obrigatória.

#### `features/samuel-runtime/tool-planner.ts`

Detectores regex para mapear linguagem natural → tool + input. Interno ao runtime.

#### `features/samuel-tool-orchestrator/tool-orchestrator.ts`

```typescript
// Responsabilidade: executar qualquer tool registrada.
// Nunca lança — sempre retorna ToolResult.
async execute(toolName, input, context): Promise<ToolResult>
```

#### `features/samuel-tool-orchestrator/tools/index.ts`

Registry de tools: 4 mocks + supabase-query + gmail + calendar + contacts + drive.

#### `features/samuel-multi-tool-task-orchestrator/multi-tool-task-orchestrator.ts`

Execução sequencial com resolução de dependências entre steps.

#### `features/samuel-tool-interpreter/tool-interpreter.ts`

Converte output de tools em `contextForAi` e `humanFallback`.

### 16.3 Domínio

#### `core/enterprise-brain-runtime/application/services/enterprise-brain-runtime.service.ts`

`buildSnapshot()` — agrega adapters de dados em snapshot organizacional.

#### `core/executive-council/application/use-cases/process-council-session.use-case.ts`

Fluxo completo: selecionar membros → opiniões → conflitos → consenso → decisão.

#### `core/ai-provider/application/services/ai-provider.service.ts`

`executeRequest(dto)` — roteamento multi-provider com fallback e health check.

#### `features/samuel-runtime/ai-gateway-narrative.adapter.ts`

Adapter que Samuel usa para gerar narrativa — abstrai o core AI Provider.

### 16.4 Memória

#### `features/samuel-conversation-memory/in-memory-conversation-memory.store.ts`

Singleton in-process. `get()` + `recordTurn()` + auto-summarization.

#### `features/samuel-execution-memory/samuel-execution-memory.service.ts`

Wrapper observabilidade — `runSamuelRuntimeWithExecutionMemory()` → `saveExecutionMemory()`.

### 16.5 Integrações Google

#### `integrations/gmail/gmail.auth.ts`

OAuth scopes, HMAC state, token exchange/refresh.

#### `integrations/gmail/gmail-token.repository.ts`

CRUD `google_oauth_connections` via service role.

#### `features/google-calendar/calendar-tool.ts`

Tool Samuel para Calendar API.

#### `features/google-contacts/contacts-tool.ts`

Tool Samuel para People API.

#### `features/google-drive/drive-tool.ts`

Tool Samuel para Drive API com extração de texto (PDF, DOCX, XLSX).

### 16.6 Infraestrutura

#### `lib/supabase/client.ts`

Cliente browser com anon key.

#### `lib/supabase/service-client.ts`

Cliente server-only com service role — **nunca importar em client components**.

#### `services/executive-context.service.ts`

`buildExecutiveContext(companyId)` — carrega empresa + dados para engines SSR.

### 16.7 UI principal

#### `features/samuel-ai/components/samuel-ai-page.tsx`

Componente raiz do Executive Workspace.

#### `features/samuel-ai/components/executive-workspace/`

Shell com sidebar (19 seções), center panel, right panel.

#### `features/samuel-ai/components/samuel-ai-shell.tsx`

**Atenção:** contém orquestração simulada do chat — candidato principal para refator no Épico 1.

#### `features/samuel-playground/components/pipeline-inspector-panel.tsx`

Inspector visual do pipeline — referência para debug.

### 16.8 Configuração

#### `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  }
}
```

#### `vitest.config.ts`

Inclui: `apps/web/src/**`, `features/**`, `core/**`, `integrations/**`, `lib/**`

#### `tsconfig.json`

Path alias: `@/*` → raiz do projeto.

---

## Apêndice A — Rotas do aplicativo

| Rota | Tipo | Finalidade |
|------|------|------------|
| `/` | Static | Placeholder teste Supabase |
| `/samuel-ai` | Static (SSR data) | **Produto principal** |
| `/samuel` | Static | UI Samuel Runtime |
| `/debug/samuel-playground` | Static | Playground dev |
| `/debug/gmail-connect` | Dynamic | OAuth debug |
| `/debug/company-brain` | Static | Company Brain debug |
| `/api/samuel/runtime` | Dynamic | API Samuel |
| `/api/company-brain/build` | Dynamic | Build Company Brain |
| `/api/integrations/gmail/*` | Dynamic | OAuth + inbox |

## Apêndice B — Referências documentais

| Documento | Caminho |
|-----------|---------|
| Visão estratégica | `VISION.md` |
| Arquitetura | `ARCHITECTURE.md` |
| Roadmap produto | `ROADMAP.md` |
| Gap analysis | `PROJECT_REVIEW.md` |
| Company Brain spec | `COMPANY_BRAIN.md` |
| Samuel Executive Brain | `docs/SAMUEL_AI_EXECUTIVE_BRAIN.md` |
| Google Drive setup | `docs/google-drive-setup.md` |
| Backlog | `project/BACKLOG.md` |
| Known Issues | `project/KNOWN_ISSUES.md` |
| Blueprint estratégico | `blueprint/00_MANIFESTO.md` … `18_ROADMAP.md` |

---

**Fim do relatório.**

*Gerado em 14/07/2026 a partir do estado do repositório `sf-growth-ai` v0.1.0. Para continuar o desenvolvimento, comece pelo Épico 1 (unificação Samuel) e configure `.env.local` conforme seção 10.*
