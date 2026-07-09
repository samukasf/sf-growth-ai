# User Stories — Estrutura Oficial

## Objetivo

Este documento define o **formato padrão** para todas as user stories do SF Growth AI.

Toda story futura deve seguir esta estrutura para garantir alinhamento com produto, Samuel Standard e jornadas do cliente.

---

## Template oficial

```markdown
# [ÉPICO] — [Sprint] — [Título da Story]

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | STORY-XXX |
| **Épico** | [Nome do épico] |
| **Sprint** | [Identificador] |
| **Prioridade** | P0 / P1 / P2 / P3 |
| **Persona** | [Persona principal] |
| **Jornada** | [Jornada do cliente] |

---

## User Story

**Como** [persona],
**quero** [ação/capacidade],
**para que** [valor/resultado].

---

## Business Goal

[Por que esta story importa para o negócio — 1–3 frases]

---

## Business Value

- [Valor 1]
- [Valor 2]
- [Valor 3]

---

## Actors

- [Ator 1]
- [Ator 2]

---

## Flow

### Passo 1
[Descrição]

### Passo 2
[Descrição]

...

---

## Acceptance Criteria

- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]

---

## Definition of Done

- [ ] Build aprovado
- [ ] Lint aprovado
- [ ] Sem regressões
- [ ] Arquitetura preservada
- [ ] Fluxo completo funcional
- [ ] Validado no Lighthouse (se aplicável)

---

## Samuel Standard Check

- [ ] Entrega ou fortalece Supercérebro?
- [ ] Cria capacidade (não tela)?
- [ ] Move indicador de valor?
- [ ] Aguenta evolução de década?

---

## Out of Scope

- [O que esta story NÃO inclui]

---

## Dependencies

- [Dependência 1]
- [Dependência 2]
```

---

## Nomenclatura

| Elemento | Formato | Exemplo |
|----------|---------|---------|
| Épico | `EPIC N — Nome` | EPIC 1 — First Customer Experience |
| Sprint | `Sprint XX` ou `ALPHA XX` | ALPHA 01 |
| Story | `Story NNN — Nome` | Story 001 — New Client Onboarding |
| ID | `STORY-XXX` | STORY-001 |

---

## Níveis de prioridade

| Nível | Significado |
|-------|-------------|
| **P0** | Bloqueia piloto ou Lighthouse |
| **P1** | Essencial para Version 1 |
| **P2** | Melhoria significativa |
| **P3** | Nice to have |

---

## Exemplo — Story 001 (referência)

| Campo | Valor |
|-------|-------|
| **ID** | STORY-001 |
| **Épico** | EPIC 1 — First Customer Experience |
| **Persona** | Atendente da Agência |
| **Jornada** | Onboarding |

**Como** atendente da Influence,
**quero** cadastrar um novo cliente,
**para que** o SF Growth AI prepare automaticamente toda a estrutura para administrar essa empresa.

**Acceptance Criteria:**
- Cliente aparece na lista da agência
- Possui Company Brain, Dashboard, Council, Memory, Timeline, Workspace
- Executive CEO gera primeiro resumo

---

## Onde registrar stories

| Fase | Local |
|------|-------|
| Product Book | Referência e template (este documento) |
| Backlog | Issues / project board |
| Implementação | Features / core conforme arquitetura |

---

## Regra de ouro

> Nenhuma story entra em desenvolvimento sem **Business Goal**, **Acceptance Criteria** e **Samuel Standard Check** preenchidos.
