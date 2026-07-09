# Product Roadmap — SF Growth AI

## Visão geral

Roadmap estruturado em **cinco fases** — da fundação à Version 1 comercial.

Cada fase tem **objetivo**, **entregas**, **critério de saída** e **status**.

---

## Fase 0 — Foundation ✅

**Objetivo:** Construir a arquitetura cognitiva do SF Growth AI.

| Entrega | Status |
|---------|--------|
| 27 módulos core (DDD) | ✅ |
| Executive Engines (CEO, Council, Projects, Opportunities, Missions domain) | ✅ |
| Enterprise Brain Runtime | ✅ |
| Agency Core | ✅ |
| Business Operating Runtime | ✅ |
| Software Factory | ✅ |
| Company Discovery + Enterprise Assessment | ✅ |
| Multi-tenant + Client Lifecycle (architecture) | ✅ |
| Blueprint completo | ✅ |
| Product Book 1.0 | ✅ |

**Critério de saída:** Arquitetura compilável, factories funcionais, blueprint documentado.

**Status:** Concluído.

---

## Fase 1 — Alpha 🔄

**Objetivo:** Primeira experiência integrada — Lighthouse Influence.

| Entrega | Status |
|---------|--------|
| Agency Workspace (11 seções) | ✅ |
| EPIC 1 — First Customer Experience | ✅ |
| Story 001 — New Client Onboarding | ✅ |
| Supercérebro provisioning flow | ✅ |
| Samuel AI executive dashboard | ✅ |
| Lighthouse operating model (docs) | ✅ |
| Product Readiness Assessment | ✅ |

**Critério de saída:** Influence opera onboarding end-to-end in-session.

**Status:** Concluído (persistência pendente para Beta).

**Gaps conhecidos:**
- Estado in-memory (refresh perde dados)
- Dual runtime (agency-workspace vs samuel-ai)
- Mocks no Samuel-ai chat/council

---

## Fase 2 — Beta

**Objetivo:** Piloto real com persistência, auth e AI.

| Entrega | Prioridade |
|---------|------------|
| Supabase persistence para core | P0 |
| Auth + RLS enforcement | P0 |
| Onboarding → Supabase companies | P0 |
| Unificar runtime (Samuel-ai usa core) | P1 |
| AI provider real (substituir noop) | P1 |
| Adapters reais inter-módulo | P1 |
| Executive Missions factory | P2 |
| 3–5 agências piloto | P1 |

**Critério de saída:** Cliente onboarded persiste após refresh; 3 agências piloto ativas.

**Timeline estimada:** Q3–Q4 2026

---

## Fase 3 — RC (Release Candidate)

**Objetivo:** Produto estável para comercialização limitada.

| Entrega | Prioridade |
|---------|------------|
| Influence com 10+ clientes reais | P0 |
| Operating model integrado (processos 1–5) | P1 |
| Software Factory — geração real | P1 |
| Marketplace MVP | P2 |
| Billing + subscription | P1 |
| SLA + monitoring | P1 |
| Security audit | P0 |

**Critério de saída:** 10 clientes pagantes; NPS ≥ 40; uptime ≥ 99.5%.

**Timeline estimada:** Q1 2027

---

## Fase 4 — Version 1

**Objetivo:** Produto comercial para agências e enterprise.

| Entrega | Prioridade |
|---------|------------|
| Agency Platform tiers (Starter/Pro/Enterprise) | P0 |
| Enterprise direct tier | P1 |
| Marketplace com parceiros | P2 |
| Software Factory comercial | P1 |
| Autonomia progressiva (nível 2: recomendação) | P1 |
| i18n (EN + PT) | P2 |
| Mobile-responsive executive dashboard | P2 |

**Critério de saída:** 50+ clientes pagantes; MRR target; churn < 3%.

**Timeline estimada:** Q3 2027

---

## Mapa visual

```
Foundation ──→ Alpha ──→ Beta ──→ RC ──→ Version 1
   ✅            ✅         ⏳       ⏳        ⏳
 2025-26       2026      2026     2027      2027
```

---

## Princípios de priorização

1. **Lighthouse first** — Influence valida antes de escalar
2. **Persistência antes de features** — sem dados, não há produto
3. **Unificar antes de expandir** — uma runtime, uma verdade
4. **Capacidade antes de tela** — Supercérebro > dashboard
5. **Samuel Standard** — checklist em toda entrega

---

## O que NÃO está no roadmap próximo

- Mobile app nativo
- Escala global multi-região
- Autonomia operacional total (nível 4)
- Enterprise OS completo
- IPO 🚀

Esses pertencem à **Vision 2035**.

---

## Revisão do roadmap

Este roadmap é revisado:

- A cada EPIC concluído
- A cada Product Readiness Assessment
- A cada feedback do Lighthouse

Última revisão: EPIC REVIEW 01 — Jul 2026
