# Grafgil — Processos Internos

> **Documento:** `blueprint/pilots/grafgil/05_INTERNAL_PROCESSES.md`  
> **Piloto:** G01 — Grafgil Enterprise Blueprint

---

## Situação Atual

A Grafgil opera com ~23 processos críticos, dos quais apenas 6 estão documentados formalmente. A maioria depende de conhecimento tribal.

### Processos críticos mapeados

| Processo | Dono | Documentado | Sistematizado |
|---|---|---|---|
| Captação de lead | Sofia | Não | Não |
| Qualificação comercial | Vendedores | Não | Não |
| Elaboração de orçamento | Sofia + vendedores | Parcial | Não |
| Aprovação de desconto >10% | Ricardo (CEO) | Não | Não |
| Entrada de encomenda | Assistente comercial | Sim | Parcial (PHC) |
| Pré-impressão / arte-final | Produção | Sim | Parcial |
| Planeamento de produção | Paulo | Não | Não |
| Produção e QC | Chefes de turno | Parcial | Não |
| Instalação | Montadores | Não | Não |
| Faturação | Ana | Sim | Sim (PHC) |
| Cobrança | Ana | Parcial | Não |
| Compras de material | Paulo + Ana | Parcial | Não |
| Gestão de stock | Armazém | Não | Não |
| Onboarding de colaborador | Ana | Não | Não |
| Gestão de reclamações | Sofia | Não | Não |

---

## Problemas

1. **Reentrada de dados** — informação do orçamento é reescrita na encomenda e novamente na produção.
2. **Gargalo de aprovação** — CEO aprova 100% dos descontos >10% sem critérios pré-definidos.
3. **Planeamento reativo** — produção só planeia após confirmação; sem visão de pipeline.
4. **QC inconsistente** — checklist existe mas não é obrigatório em jobs urgentes.
5. **Reclamações sem SLA** — tempo médio de resolução: 8 dias.
6. **Stock opaco** — rupturas descobertas no momento da produção.

---

## Oportunidades

1. **Order-to-Cash digital** — fluxo único do lead à cobrança.
2. **Políticas de desconto automatizadas** — regras no Supercérebro; exceções vão para Executive Inbox.
3. **Planeamento assistido** — COO cruza pipeline comercial com capacidade produtiva.
4. **QC obrigatório digital** — checklist no tablet antes de libertar job.
5. **Gestão de reclamações com SLA** — 48h para resposta, 5 dias para resolução.
6. **Reposição automática de stock** — watcher dispara compra quando abaixo do mínimo.

---

## Como o Supercérebro atuará

| Processo | Engine / Camada | Atuação |
|---|---|---|
| Lead → Orçamento | Executive Orchestrator + CRO | Qualifica, prioriza, gera proposta |
| Aprovação de desconto | Executive Inbox + CFO | Aplica política; escala exceções |
| Encomenda → Produção | Executive Knowledge + COO | Handoff automático com specs |
| Planeamento | Enterprise Brain Runtime | Cruza pipeline + capacidade + stock |
| QC | Executive Watchers | Bloqueia job sem checklist completo |
| Faturação → Cobrança | CFO + Watchers | Fatura automática; alerta inadimplência |
| Reclamações | Executive Timeline | Regista, SLA, aprendizagem na Memory |

**Automação prioritária (Sprint piloto):**
1. Alerta de lead sem resposta > 48h
2. Handoff comercial → produção sem reentrada
3. Alerta de stock crítico
4. Cobrança automática D+30

---

## Impacto esperado

| Processo | Métrica | Atual | Meta |
|---|---|---|---|
| Order-to-Cash | Ciclo completo | 18 dias | 12 dias |
| Orçamento | Tempo de elaboração | 3,5h | 1h |
| Produção | OTD | 82% | 94% |
| QC | Jobs sem checklist | 40% | <5% |
| Cobrança | DSO | 47 dias | 32 dias |
| Reclamações | Tempo de resolução | 8 dias | 4 dias |

---

## ROI esperado

| Ganho | Valor anual |
|---|---|
| Eliminação de reentrada de dados (12h/sem × €25/h) | €15.600 |
| Redução de retrabalho (−5 pp) | €42.000 |
| Aceleração de cobrança (DSO −15 dias) | €38.000 (caixa) |
| Menos rupturas de stock | €9.000 |
| **Total processos** | **€104.600** |

**ROI:** 481%
