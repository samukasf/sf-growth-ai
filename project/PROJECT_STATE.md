# PROJECT STATE — SF Growth AI

## Objetivo

Registrar o estado atual do projeto em um único lugar: versão, sprint, última entrega, saúde de build/testes/deploy e próxima meta. Atualizar ao fim de cada story ou sprint.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Ativo |
| **Última atualização** | 2026-07-14 |
| **Responsável** | Engenharia / Produto |

---

## Estado do projeto

| Campo | Valor |
|-------|-------|
| **Versão** | 0.1.0 |
| **Sprint** | 86+ — Samuel Runtime + Google Workspace |
| **Último Épico** | Samuel Tool Calling + Google OAuth unificado |
| **Última Story** | Google Drive/Calendar/Contacts tools + Multi-Tool Orchestrator + Relatório Técnico |
| **Build** | ✅ `npm run build` — sucesso (14 rotas) |
| **Lint** | ⚠️ `npm run lint` — 0 erros, 104 warnings |
| **Tests** | ⚠️ `npm run test` — 363/367 pass (2 falhas PDF timeout Drive) |
| **Deploy** | Não configurado (local / Vercel futuro) |
| **Próxima Meta** | Épico 1 — Unificar chat `/samuel-ai` com `/api/samuel/runtime` |

---

## Situação real do produto (jul/2026)

| Área | Status | Notas |
|------|--------|-------|
| **Samuel Runtime API** | ✅ Produção-ready | Pipeline 11 fases, LLM, tools |
| **Executive Workspace** | ⚠️ Demo avançado | `/samuel-ai` — chat simulado, inbox sem persistência |
| **Google OAuth** | ✅ Real | Gmail + Calendar + Contacts + Drive |
| **Auth / Onboarding** | ❌ Stub | `features/auth/` vazio |
| **Company Brain (runtime)** | ✅ Parcial | Snapshot + adapters Supabase |
| **Executive Council IA** | ✅ Opcional | Kill-switch `EXECUTIVE_COUNCIL_AI_ENABLED` |

**Documento de referência:** `docs/RELATORIO_TECNICO_SF_GROWTH_AI.md`

---

## Saúde do repositório

| Check | Comando | Último resultado (2026-07-14) |
|-------|---------|-------------------------------|
| Build | `npm run build` | ✅ Compilado em ~65s |
| Lint | `npm run lint` | ⚠️ 0 erros, 104 warnings |
| Test | `npm run test` | ⚠️ 363 pass / 2 fail / 2 skip (59 arquivos) |

---

## Rotas ativas

| Rota | Função |
|------|--------|
| `/samuel-ai` | Produto principal — Executive Workspace |
| `/samuel` | UI Samuel Runtime (pipeline real) |
| `/debug/samuel-playground` | Inspector de pipeline |
| `/debug/gmail-connect` | OAuth Google + teste inbox |
| `POST /api/samuel/runtime` | API Samuel completa |

---

## Próximos passos

- [ ] Unificar ChatPanel do Workspace com `POST /api/samuel/runtime`
- [ ] Implementar Auth + Onboarding (Supabase)
- [ ] Persistência Executive Inbox
- [ ] Corrigir 2 testes PDF timeout (Google Drive)
- [ ] Configurar deploy Vercel + CI

## Referências

- `docs/RELATORIO_TECNICO_SF_GROWTH_AI.md` — relatório técnico completo
- `project/BACKLOG.md`
- `project/SPRINT.md`
- `project/CHANGELOG.md`
- `PROJECT_REVIEW.md`
