# ARCHITECTURE — SF Growth AI

## Objetivo

Documentar a arquitetura técnica oficial do SF Growth AI: camadas, módulos, fluxos de dados e convenções de código. Fonte única para engenharia, Cursor e ChatGPT.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Ativo |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Engenharia |

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend / App** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend / API** | Next.js App Router (`app/api/`) |
| **Dados** | Supabase |
| **Testes** | Vitest |
| **Lint** | ESLint (eslint-config-next) |

## Estrutura de código

```
sf-growth-ai/
├── app/                    # Rotas Next.js (pages, API)
├── features/               # Features de produto (ex.: samuel-ai)
├── core/                   # Domínios e engines (hexagonal / DDD)
├── lib/                    # Utilitários compartilhados
├── docs/                   # Documentação oficial (este OS)
├── specs/                  # Especificações funcionais por módulo
├── project/                # Estado, backlog, sprint, decisões
└── blueprint/              # Master Blueprint estratégico (referência)
```

## Camadas principais

| Documentação | Código |
|--------------|--------|
| Organization Brain | `core/organization/` |
| Company Brain | `core/company-discovery/`, API `app/api/company-brain/` |
| Executive Council | `core/executive-council/` |
| Executive Orchestrator | `core/executive-orchestrator/` |
| Samuel AI (workspace) | `features/samuel-ai/` |
| Software Factory | `core/software-factory/` |

## Princípios arquiteturais

- **Organização como unidade** — Permissões, contexto e decisões por empresa
- **Domínio isolado** — `core/` com ports/adapters; features consomem use cases
- **Documentação viva** — `docs/`, `specs/` e `project/` são a fonte operacional; `blueprint/` é referência estratégica

## Próximos passos

- [ ] Consolidar diagramas de fluxo (Orchestrator → Engines → Brain)
- [ ] Documentar contratos de API em cada spec
- [ ] Alinhar com `blueprint/15_ARCHITECTURE.md` e docs legados em `docs/03-architecture/`

## Referências

- `blueprint/15_ARCHITECTURE.md`
- `docs/03-architecture/SF_GROWTH_AI_ARCHITECTURE_V1.md`
- `docs/00-master/SF_GROWTH_AI_MASTER_ARCHITECTURE.md`
- `AGENTS.md` — Regras para agentes de IA no repositório
