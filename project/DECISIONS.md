# DECISIONS — SF Growth AI

## Objetivo

Registrar decisões arquiteturais, de produto e de processo (ADRs simplificados). Cada entrada documenta contexto, decisão, consequências e data — para ChatGPT, Cursor e futuros desenvolvedores.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Ativo |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Engenharia / Produto |

---

## ADR-001 — Project Operating System como fonte única

| Campo | Valor |
|-------|-------|
| **Data** | 2026-07-11 |
| **Status** | Aceito |
| **Story** | 000.1 |

**Contexto:** Documentação espalhada entre `blueprint/`, `docs/` legado e código. Agentes de IA e devs precisam de uma fonte operacional única.

**Decisão:** Criar três pastas oficiais na raiz:
- `docs/` — visão, produto, arquitetura, design, roadmap
- `specs/` — especificação funcional por módulo
- `project/` — estado, backlog, sprint, changelog, decisões, issues

O `blueprint/` permanece referência estratégica histórica; não é alterado por esta story.

**Consequências:**
- (+) Navegação clara para humanos e agentes
- (+) Templates padronizados em todos os arquivos
- (−) Duplicidade temporária com docs legados até consolidação (Story 000.2)

---

## ADR-002 — Organização como unidade de decisão

| Campo | Valor |
|-------|-------|
| **Data** | (herdado do manifesto) |
| **Status** | Aceito |
| **Story** | — |

**Contexto:** Samuel AI não deve servir apenas um usuário isolado.

**Decisão:** Permissões, contexto, dashboards e recomendações são orientados à **organização/empresa**.

**Consequências:** Company Brain e Organization Brain são pré-requisitos para features executivas completas.

---

## Próximos passos

- [ ] ADR-003: estratégia de consolidação docs legados → specs
- [ ] ADR-004: convenções de API (App Router)
- [ ] Revisar ADRs obsoletos trimestralmente

## Referências

- `docs/ARCHITECTURE.md`
- `blueprint/00_MANIFESTO.md`
