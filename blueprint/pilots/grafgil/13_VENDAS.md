# Grafgil Digital Twin — Vendas

> **Camada:** Business Twin™ — Pipeline e receita  
> **Documento:** `blueprint/pilots/grafgil/13_VENDAS.md`

---

## Estado Atual

| Etapa | Volume/mês | Conversão |
|---|---|---|
| Leads recebidos | 44 | — |
| Qualificados | 32 | 73% |
| Orçamentos enviados | 28 | 88% |
| Negociação | 14 | 50% |
| Fechados | 8 | 57% |
| **Conversão global** | | **18%** |

**Pipeline:** ~€185.000 (Excel disperso) · 4 vendedores · Forecast inexistente · Ciclo médio 14–45 dias.

---

## Objetivos

1. Conversão orçamento → encomenda de 28% para 38%.
2. Pipeline 100% visível em tempo real no Supercérebro.
3. Forecast accuracy ±10%.
4. Receita por vendedor de €400k para €520k/ano.
5. Eliminar deals perdidos por falta de follow-up.

---

## Problemas

- Pipeline em Excel — CEO não tem visibilidade.
- 35% orçamentos sem follow-up após 7 dias.
- 4 templates de proposta com margens diferentes.
- Todos os leads tratados com mesma prioridade.
- Desconto médio 12% sem governança.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Follow-up manual | €35k/ano em deals perdidos |
| Orçamento lento | Cliente desiste ou vai à concorrência |
| CEO como aprovador de descontos | 4–8h de espera |

---

## Oportunidades

- CRM integrado ao Supercérebro.
- Scoring de leads por valor, margem e probabilidade.
- Reunião semanal de vendas com Supercérebro (pipeline + riscos).
- Política de descontos automatizada.
- Cross-sell e upsell assistidos por histórico do cliente.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Scoring de lead | Novo lead | Prioriza na fila do vendedor |
| Follow-up | D+1, D+3, D+7 | Email + alerta |
| Alerta deal parado | >14 dias | CRO notifica vendedor + Sofia |
| Forecast semanal | Sexta 16h | CRO gera previsão de fecho |
| Validação margem | Proposta criada | CFO aprova ou bloqueia |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Conversão orçamento → encomenda | 28% | 38% |
| Pipeline visível | 0% | 100% |
| Forecast accuracy | N/A | ±10% |
| Receita/vendedor/ano | €400k | €520k |
| Follow-up em 48h | 65% | 98% |
| Desconto médio | 12% | 7% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Direção comercial | Sofia Gil |
| Vendedores | 4 externos |
| Pricing | Sofia Gil + Ana Gil |
| Curadoria no Twin | CRO + Executive Memory |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| CRM / Pipeline | Deals, estágios, forecast |
| PHC | Faturação por vendedor |
| Email | Propostas e follow-ups |
| Executive Inbox | Aprovação de descontos |
| Website | Leads e origem |
