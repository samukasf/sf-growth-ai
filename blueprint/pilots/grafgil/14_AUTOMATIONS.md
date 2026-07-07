# Grafgil — Automações

> **Documento:** `blueprint/pilots/grafgil/14_AUTOMATIONS.md`  
> **Piloto:** G01 — Grafgil Enterprise Blueprint

---

## Situação Atual

A Grafgil tem **zero automações** formais. Todos os processos dependem de ação humana manual.

### Tarefas repetitivas identificadas (horas/semana)

| Tarefa | Horas/sem | Responsável | Automatizável |
|---|---|---|---|
| Resposta inicial a leads | 6h | Comercial | Sim |
| Elaboração de orçamentos | 12h | Comercial | Parcial |
| Follow-up de propostas | 5h | Comercial | Sim |
| Entrada de encomendas no ERP | 4h | Admin | Sim |
| Planeamento de produção | 6h | Produção | Parcial |
| Alertas de stock | 2h | Armazém | Sim |
| Faturação pós-entrega | 3h | Financeiro | Sim |
| Cobranças e lembretes | 4h | Financeiro | Sim |
| Relatório semanal para CEO | 3h | Admin | Sim |
| Agendamento de instalações | 3h | Produção | Sim |
| **Total** | **48h/sem** | | **~75%** |

**Potencial de libertação:** ~36 horas/semana (equivalente a 1 FTE).

---

## Problemas

1. **Tempo humano em tarefas de baixo valor** — 48h/semana em trabalho repetitivo.
2. **Erros por fadiga** — reentrada de dados causa 15% dos erros operacionais.
3. **Sem escala** — crescer 20% em receita exigiria contratar 2–3 pessoas.
4. **Dependência de pessoas-chave** — Ana (faturação) e Sofia (orçamentos) são gargalos.
5. **Reatividade** — alertas só quando alguém se lembra de verificar.
6. **Custo de oportunidade** — equipa comercial gasta 40% do tempo em admin.

---

## Oportunidades de automação

### Fase 1 — Quick wins (0–30 dias)

| # | Automação | Trigger | Ação | Poupança |
|---|---|---|---|---|
| A1 | Resposta automática a lead | Formulário web / email | Confirmação + SLA + notifica vendedor | 4h/sem |
| A2 | Alerta lead sem resposta | >48h sem contacto | Notifica CRO + vendedor | 2h/sem |
| A3 | Briefing diário automático | 08h00 | Gera e envia snapshot executivo | 3h/sem |
| A4 | Alerta stock crítico | Stock < mínimo | Notifica COO + compras | 2h/sem |

### Fase 2 — Core (30–90 dias)

| # | Automação | Trigger | Ação | Poupança |
|---|---|---|---|---|
| A5 | Follow-up de orçamento | D+1, D+3, D+7 | Email automático + alerta vendedor | 4h/sem |
| A6 | Handoff comercial → produção | Encomenda confirmada | Cria job com specs no ERP | 4h/sem |
| A7 | Faturação automática | Job concluído + QC OK | Gera fatura no PHC | 3h/sem |
| A8 | Sequência de cobrança | D-7, D+1, D+15, D+30 | Emails + alerta financeiro | 3h/sem |

### Fase 3 — Avançado (90–180 dias)

| # | Automação | Trigger | Ação | Poupança |
|---|---|---|---|---|
| A9 | Geração de orçamento preliminar | Lead qualificado | Template + pricing do Knowledge | 6h/sem |
| A10 | Planeamento de produção | Pipeline atualizado | Sugere sequência de jobs | 4h/sem |
| A11 | Agendamento de instalação | Job pronto | Propõe slot + confirma com cliente | 3h/sem |
| A12 | Relatório semanal executivo | Sexta 17h | PDF com KPIs + recomendações | 3h/sem |

---

## Como o Supercérebro atuará

| Camada | Papel nas automações |
|---|---|
| **Executive Watchers** | Motor de triggers: monitoriza condições e dispara ações |
| **Executive Orchestrator** | Coordena fluxos multi-passo (ex.: lead → orçamento → produção) |
| **Executive Inbox** | Pausa automação quando precisa de aprovação humana |
| **Executive Knowledge** | Regras de negócio: margens mínimas, SLAs, políticas |
| **Executive Memory** | Aprende com exceções para refinar automações |
| **CTO (Conselho)** | Define integrações técnicas (PHC, email, WhatsApp API) |

**Princípio:** Automatizar o repetitivo; escalar o importante para humanos via Inbox.

---

## Impacto esperado

| Métrica | Atual | Meta 12 meses |
|---|---|---|
| Horas/semana em tarefas repetitivas | 48h | 12h |
| Automações ativas | 0 | 12 |
| Erros por reentrada de dados | 15% | 3% |
| Tempo de resposta a lead | 36h | 15min (confirmação) |
| Faturas emitidas no dia da entrega | 40% | 90% |

---

## ROI esperado

| Benefício | Valor anual |
|---|---|
| Poupança de tempo (36h/sem × €25/h × 48 sem) | €43.200 |
| Redução de erros operacionais | €18.000 |
| Conversão melhorada por follow-up automático | €35.000 |
| Cobrança mais rápida (automação D+30) | €21.000 |
| Escala sem contratação (evita 1 FTE) | €28.000 |
| **Total automações** | **€145.200** |

**ROI:** 706%
