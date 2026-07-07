# Grafgil Digital Twin — Orçamentos

> **Camada:** Business Twin™ — Proposta comercial  
> **Documento:** `blueprint/pilots/grafgil/08_ORCAMENTOS.md`

---

## Estado Atual

| Métrica | Valor |
|---|---|
| Orçamentos/mês | 28 |
| Tempo médio de elaboração | 3,5 horas |
| Taxa de conversão | 28% |
| Desconto médio aplicado | 12% |
| Templates em uso | 4 (inconsistentes) |
| Orçamentos sem follow-up (7 dias) | 35% |
| Margem média nos orçamentos | Desconhecida em tempo real |

**Fluxo:** Lead → qualificação verbal → cálculo manual (Excel/Canva) → PDF por email → negociação → aprovação verbal.

---

## Objetivos

1. Reduzir tempo de orçamento para <45 minutos (standard) e <4h (complexo).
2. Garantir margem mínima de 30% em todos os orçamentos.
3. Aumentar conversão para 38% com follow-up sistemático.
4. Padronizar templates com identidade de marca.
5. Modelar regras de pricing no Twin para validação automática.

---

## Problemas

- Cada vendedor calcula de forma diferente — margens variam 15–25 pp.
- 35% dos orçamentos morrem por falta de follow-up.
- Descontos sem governança — CEO aprova todos >10%.
- Sem visão de pipeline: CEO não sabe valor em negociação.
- Orçamentos complexos demoram 1–2 dias (cliente desiste).

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Cálculo manual | 12h/semana da equipa comercial |
| Aprovação de desconto pelo CEO | 4–8h de espera |
| Sem template inteligente | Inconsistência e retrabalho |

---

## Oportunidades

- Template inteligente com pricing do Executive Knowledge.
- Orçamento preliminar automático para leads qualificados.
- Follow-up D+1, D+3, D+7 automatizado.
- Política de descontos: regras no Supercérebro, exceções no Inbox.
- Cross-sell sugerido automaticamente no orçamento.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Orçamento preliminar | Lead qualificado | Gera proposta base com margem validada |
| Validação de margem | Orçamento criado | Bloqueia se <30% sem aprovação |
| Follow-up automático | D+1, D+3, D+7 | Email + alerta vendedor |
| Alerta deal parado | >14 dias sem movimento | CRO notifica vendedor + CEO |
| Aprovação de desconto | Desconto > política | Executive Inbox → CEO |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Tempo médio orçamento | 3,5h | 45min |
| Taxa de conversão | 28% | 38% |
| Follow-up em 48h | 65% | 98% |
| Desconto médio | 12% | 7% |
| Margem média orçamentos | N/A | >38% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Elaboração | Vendedores + Sofia Gil |
| Pricing e margens | Ana Gil + Sofia Gil |
| Aprovação de exceções | Ricardo Gil (CEO) |
| Curadoria no Twin | CRO + Executive Knowledge |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| Executive Knowledge | Catálogo, pricing, margens mínimas |
| PHC | Custos reais de materiais |
| Email | Envio e tracking de propostas |
| CRM / Pipeline | Status e forecast |
| Configurador web (fase 2) | Self-service preliminar |
