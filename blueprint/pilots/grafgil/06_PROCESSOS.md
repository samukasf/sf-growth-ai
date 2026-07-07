# Grafgil Digital Twin — Processos

> **Camada:** Business Twin™ — Fluxos operacionais  
> **Documento:** `blueprint/pilots/grafgil/06_PROCESSOS.md`

---

## Estado Atual

23 processos críticos identificados; apenas 6 documentados formalmente.

| Processo | Dono | Documentado | Sistematizado |
|---|---|---|---|
| Captação de lead | Sofia | Não | Não |
| Qualificação comercial | Vendedores | Não | Não |
| Elaboração de orçamento | Sofia + vendas | Parcial | Não |
| Aprovação de desconto >10% | CEO | Não | Não |
| Entrada de encomenda | Assistente | Sim | Parcial |
| Pré-impressão / arte-final | Produção | Sim | Parcial |
| Planeamento de produção | Paulo | Não | Não |
| Produção e QC | Chefes turno | Parcial | Não |
| Instalação | Montadores | Não | Não |
| Faturação | Ana | Sim | Sim |
| Cobrança | Ana | Parcial | Não |
| Compras de material | Paulo + Ana | Parcial | Não |
| Gestão de stock | Armazém | Não | Não |
| Gestão de reclamações | Sofia | Não | Não |

**Ciclo Order-to-Cash:** 18 dias (média).

---

## Objetivos

1. Documentar 100% dos processos críticos no Executive Knowledge.
2. Mapear handoffs entre departamentos e eliminar reentrada de dados.
3. Definir SLAs por processo (orçamento, produção, cobrança, reclamação).
4. Modelar fluxos no Twin para simulação e automação.
5. Estabelecer políticas de exceção com aprovação via Executive Inbox.

---

## Problemas

- Reentrada de dados em 3 pontos do fluxo (12h/semana).
- CEO aprova 100% dos descontos >10% sem critérios pré-definidos.
- Planeamento de produção reativo (após confirmação).
- QC não obrigatório em jobs urgentes (40% sem checklist).
- Reclamações: tempo médio de resolução 8 dias.

---

## Gargalos

| Processo | Gargalo | Tempo perdido |
|---|---|---|
| Orçamento | Cálculo manual | 12h/sem |
| Handoff comercial→produção | Reentrada de specs | 4h/sem |
| Aprovação de desconto | Espera pelo CEO | 4–8h por exceção |
| Cobrança | Contacto manual D+45 | 4h/sem |

---

## Oportunidades

- Order-to-Cash digital end-to-end.
- Políticas de desconto automatizadas no Supercérebro.
- Planeamento assistido: pipeline + capacidade + stock.
- QC digital obrigatório antes de libertar job.
- SLA de reclamações: 48h resposta, 5 dias resolução.

---

## Automações possíveis

| ID | Processo | Automação |
|---|---|---|
| P1 | Lead → Orçamento | Qualificação + template automático |
| P2 | Desconto | Regra automática; exceção → Inbox |
| P3 | Encomenda → Produção | Handoff sem reentrada |
| P4 | Produção → Faturação | Fatura automática pós-QC |
| P5 | Cobrança | Sequência D-7, D+1, D+15, D+30 |
| P6 | Stock | Reposição automática |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Processos documentados | 26% | 100% |
| Ciclo Order-to-Cash | 18 dias | 12 dias |
| Reentrada de dados | 12h/sem | 2h/sem |
| QC obrigatório | 60% | 95% |
| SLA reclamações cumprido | 40% | 90% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Mapeamento de processos | Paulo Ferreira + Sofia Gil |
| SOPs e documentação | Miguel Santos (Executive Knowledge) |
| Políticas de exceção | Ricardo Gil (CEO) |
| Curadoria no Twin | COO + CBO |

---

## Integrações futuras

| Integração | Processos afetados |
|---|---|
| PHC | Encomenda, faturação, compras, stock |
| Executive Orchestrator | Fluxos multi-passo |
| Executive Inbox | Aprovações e exceções |
| Executive Watchers | SLAs e alertas |
