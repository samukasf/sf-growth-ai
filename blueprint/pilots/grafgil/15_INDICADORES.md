# Grafgil Digital Twin — Indicadores

> **Camada:** Business Twin™ — KPIs e métricas  
> **Documento:** `blueprint/pilots/grafgil/15_INDICADORES.md`

---

## Estado Atual

A Grafgil mede indicadores de forma irregular — alguns mensalmente (faturação), outros nunca (NPS, CAC, OTD).

### Dashboard atual

| Área | Indicadores medidos | Frequência | Ferramenta |
|---|---|---|---|
| Financeiro | Faturação, caixa | Mensal | PHC + Excel |
| Comercial | Vendas por vendedor | Mensal | Excel |
| Produção | Jobs concluídos | Semanal | Quadro branco |
| Marketing | Nenhum | — | — |
| Atendimento | Nenhum | — | — |
| RH | Nenhum | — | — |

**Problema central:** CEO não tem um único painel com todos os KPIs.

---

## Objetivos

1. Definir KPIs universais da Grafgil no Twin (máximo 25 indicadores).
2. Briefing diário do Supercérebro com top 10 KPIs.
3. Alertas automáticos quando KPI desvia >10% do target.
4. Histórico de 12 meses para tendências e benchmarks.
5. Review mensal com evolução e recomendações do Conselho.

---

## Problemas

- Indicadores dispersos — CEO gasta 3h/semana a compilar relatório manual.
- Sem metas formais por departamento.
- Produção mede volume, não qualidade (OTD, retrabalho).
- Marketing e atendimento não medidos.
- Decisões sem baseline — impossível provar ROI do Supercérebro.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Compilação manual | 3h/semana do admin |
| Sem metas | Equipa sem direção clara |
| Dados defasados | Decisões com 30 dias de atraso |

---

## Oportunidades

- Enterprise Brain Runtime como dashboard vivo.
- Executive Watchers como alertas de desvio.
- Benchmarking mês a mês automático.
- KPIs como base para bónus departamentais (fase 2).
- Prova de ROI do piloto com dados antes/depois.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Briefing diário | 08h00 | Top 10 KPIs no Samuel AI |
| Alerta de desvio | KPI >10% fora do target | Watcher notifica responsável |
| Relatório semanal | Sexta 17h | PDF com evolução + recomendações |
| Relatório mensal | Dia 1 | Conselho analisa tendências |
| Snapshot histórico | Diário | Armazena na Executive Memory |

---

## Indicadores (painel oficial Grafgil)

| # | KPI | Atual | Meta 12m | Responsável |
|---|---|---|---|---|
| K01 | Faturação mensal | €233k | €267k | CEO |
| K02 | Margem bruta | 42% | 46% | CFO |
| K03 | EBITDA | 12% | 16% | CFO |
| K04 | DSO | 47d | 32d | CFO |
| K05 | Conversão comercial | 28% | 38% | CRO |
| K06 | Pipeline valor | €185k | €280k | CRO |
| K07 | OTD produção | 82% | 94% | COO |
| K08 | Retrabalho | 11% | 6% | COO |
| K09 | Leads/mês | 44 | 72 | CMO |
| K10 | NPS | 62 | 74 | CRO |
| K11 | Inadimplência | 9% | 4% | CFO |
| K12 | Utilização máquinas | 68% | 82% | COO |
| K13 | Tempo orçamento | 3,5h | 45min | CRO |
| K14 | Receita recorrente | 12% | 28% | CRO |
| K15 | Cobertura Twin | 0% | 100% | CBO |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Definição de KPIs | Ricardo Gil (CEO) |
| Dados financeiros | Ana Gil |
| Dados comerciais | Sofia Gil |
| Dados operacionais | Paulo Ferreira |
| Plataforma e alertas | Miguel Santos |
| Curadoria no Twin | CBO + Enterprise Brain Runtime |

---

## Integrações futuras

| Integração | KPIs alimentados |
|---|---|
| PHC | K01–K04, K11 |
| Pipeline / CRM | K05, K06, K13 |
| Produção | K07, K08, K12 |
| Analytics | K09 |
| NPS tool | K10 |
| Enterprise Brain | Todos (snapshot unificado) |
