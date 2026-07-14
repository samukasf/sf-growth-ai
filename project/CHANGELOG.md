# CHANGELOG — SF Growth AI

## Objetivo

Registrar mudanças relevantes do projeto por versão e data: features, correções, breaking changes e marcos de documentação. Formato inspirado em Keep a Changelog.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Ativo |
| **Última atualização** | 2026-07-14 |
| **Responsável** | Engenharia |

---

## [Unreleased]

### Added

- **Relatório técnico completo**: `docs/RELATORIO_TECNICO_SF_GROWTH_AI.md`
- **Google OAuth unificado** (Sprint 86): Gmail, Calendar, Contacts, Drive
- Migration `009_google_oauth_connections` + `lib/supabase/service-client.ts`
- Samuel tools: Gmail, Google Calendar, Contacts, Drive, Supabase Query
- Multi-Tool Task Orchestrator (fluxo reunião + e-mail)
- Tool Interpreter para contexto LLM a partir de resultados de tools
- Adapters Supabase para Company Brain (`supabase-data-source-adapters`)
- Rotas debug: `/debug/gmail-connect`; APIs `/api/integrations/gmail/*`
- Testes: 59 arquivos Vitest cobrindo runtime, tools e integrações Google

### Changed

- `PROJECT_STATE.md` atualizado com situação real (build/lint/test)
- Samuel Runtime: pipeline expandido com tooling Google e multi-tool
- `.env.example`: variáveis OAuth Google e kill-switches Samuel

### Known issues

- 2 testes PDF timeout em `features/google-drive/`
- Chat `/samuel-ai` ainda simulado (não usa `/api/samuel/runtime`)
- Branch local divergiu de `origin/main` (15 ahead / 34 behind) — merge pendente

- Estrutura **Project Operating System**: `docs/`, `specs/`, `project/`
- Documentos oficiais: VISION, PRODUCT, ARCHITECTURE, DESIGN_SYSTEM, ROADMAP
- Specs: company-brain, samuel, executive-council, discovery, marketing, software-factory
- Gestão: PROJECT_STATE, BACKLOG, SPRINT, CHANGELOG, DECISIONS, KNOWN_ISSUES

---

## [0.1.0] — 2026-07-11

### Added

- Projeto Next.js 16 + React 19 + Supabase
- Rotas: `/`, `/samuel-ai`, `/debug/company-brain`
- API: `/api/company-brain/build`
- Módulos core: executive-council, company-discovery, software-factory, samuel-ai feature

---

## Próximos passos

- [ ] Registrar conclusão da Story 000.1 em [Unreleased]
- [ ] Bump de versão quando épico 001 for concluído
- [ ] Manter entradas concisas e orientadas ao usuário/desenvolvedor

## Referências

- `project/PROJECT_STATE.md`
- `project/SPRINT.md`
