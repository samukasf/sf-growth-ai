# Grafgil Digital Twin — Automações

> **Camada:** Business Twin™ — Fluxos automatizáveis  
> **Documento:** `blueprint/pilots/grafgil/16_AUTOMACOES.md`

---

## Estado Atual

**Zero automações formais.** 48 horas/semana em tarefas repetitivas (~75% automatizáveis).

| Tarefa | Horas/sem | Automatizável |
|---|---|---|
| Resposta a leads | 6h | Sim |
| Elaboração de orçamentos | 12h | Parcial |
| Follow-up de propostas | 5h | Sim |
| Entrada de encomendas | 4h | Sim |
| Planeamento de produção | 6h | Parcial |
| Alertas de stock | 2h | Sim |
| Faturação | 3h | Sim |
| Cobranças | 4h | Sim |
| Relatório CEO | 3h | Sim |
| Agendamento instalação | 3h | Sim |

---

## Objetivos

1. Implementar 12 automações em 180 dias.
2. Libertar 36 horas/semana de trabalho repetitivo.
3. Manter humano no loop para exceções (Executive Inbox).
4. Priorizar automações por ROI e facilidade.
5. Modelar cada automação no Twin com trigger, ação e responsável.

---

## Problemas

- Tudo manual — escala exige contratação.
- Erros por fadiga na reentrada de dados (15% dos erros).
- Alertas só quando alguém se lembra de verificar.
- Comercial gasta 40% do tempo em admin.
- Sem documentação de fluxos automatizáveis.

---

## Gargalos

| Gargalo | Horas/sem |
|---|---|
| Reentrada de dados | 12h |
| Follow-up manual | 5h |
| Relatório CEO manual | 3h |

---

## Oportunidades

48 horas/semana mapeadas — 36 automatizáveis = equivalente a 1 FTE libertado.

### Roadmap de automações

| Fase | ID | Automação | Poupança |
|---|---|---|---|
| 0–30d | A1 | Resposta automática a lead | 4h/sem |
| 0–30d | A2 | Alerta lead sem resposta >48h | 2h/sem |
| 0–30d | A3 | Briefing diário automático | 3h/sem |
| 0–30d | A4 | Alerta stock crítico | 2h/sem |
| 30–90d | A5 | Follow-up orçamento D+1/3/7 | 4h/sem |
| 30–90d | A6 | Handoff comercial → produção | 4h/sem |
| 30–90d | A7 | Faturação automática pós-QC | 3h/sem |
| 30–90d | A8 | Sequência de cobrança | 3h/sem |
| 90–180d | A9 | Orçamento preliminar automático | 6h/sem |
| 90–180d | A10 | Planeamento de produção | 4h/sem |
| 90–180d | A11 | Agendamento de instalação | 3h/sem |
| 90–180d | A12 | Relatório semanal executivo | 3h/sem |

---

## Automações possíveis

Todas as 12 automações acima serão implementadas via:

| Camada | Papel |
|---|---|
| **Executive Watchers** | Triggers e monitorização |
| **Executive Orchestrator** | Fluxos multi-passo |
| **Executive Inbox** | Pausa para aprovação humana |
| **Executive Knowledge** | Regras de negócio |
| **CTO** | Integrações técnicas (PHC, email) |

**Regra:** Automatizar o repetitivo; escalar exceções para humanos.

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Automações ativas | 0 | 12 |
| Horas/semana em tarefas repetitivas | 48h | 12h |
| Erros por reentrada de dados | 15% | 3% |
| Tempo resposta lead (confirmação) | 36h | 15min |
| Faturas no dia da entrega | 40% | 90% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Implementação técnica | Miguel Santos |
| Regras de negócio | Ricardo Gil + heads |
| Validação comercial | Sofia Gil |
| Validação operacional | Paulo Ferreira |
| Curadoria no Twin | CTO + COO |

---

## Integrações futuras

| Integração | Automações dependentes |
|---|---|
| PHC | A6, A7, A8, A10 |
| Email | A1, A5, A8 |
| Website | A1, A2 |
| Executive Watchers | A2, A4, todas |
| SMS/WhatsApp | A11, notificações cliente |
