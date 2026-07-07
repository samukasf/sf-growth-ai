# Grafgil Digital Twin — Empresa

> **Projeto:** Piloto G01 — Grafgil Digital Twin  
> **Camada:** Business Twin™ — Entidade raiz  
> **Documento:** `blueprint/pilots/grafgil/00_EMPRESA.md`  
> **Versão:** 1.0 · Julho 2026

---

## Estado Atual

| Atributo | Valor modelado |
|---|---|
| Razão social | Grafgil Comunicação Visual, Lda. |
| NIF | 5XX XXX XXX |
| Sede | Rua das Indústrias 42, Maia, 4475-000 |
| Fundação | 1987 |
| Setor | Comunicação visual B2B |
| Colaboradores | 34 |
| Faturação anual | €2.800.000 |
| Margem bruta | 42% |
| EBITDA | 12% |
| Clientes ativos | 180 |
| Fornecedores ativos | 34 |

A Grafgil é a **primeira entidade empresarial** cujo funcionamento integral será modelado pelo Supercérebro do SF Growth AI. Este documento é a raiz do Gêmeo Digital — todos os demais documentos (`01`–`19`) derivam desta entidade.

**Stack atual:** PHC (ERP parcial) · Excel (CRM, caixa) · Outlook · WhatsApp · WordPress (website estático).

---

## Objetivos

1. Representar digitalmente 100% das áreas operacionais da Grafgil no Business Twin™.
2. Permitir que o Supercérebro tome decisões com base em dados estruturados, não em intuição.
3. Servir como template replicável para futuros pilotos (G02, G03…).
4. Alimentar Enterprise Brain Runtime com snapshot unificado da empresa.
5. Evoluir de modelo estático (documentação) para modelo vivo (dados em tempo real) em fases.

---

## Problemas

- Não existe representação digital unificada da empresa — informação em 5+ sistemas isolados.
- O Supercérebro opera hoje com dados mock; precisa de modelo factual da Grafgil.
- Decisões executivas não têm contexto histórico estruturado.
- Impossível simular cenários ("e se contratarmos 2 vendedores?") sem modelo base.
- Onboarding de novos colaboradores depende de conhecimento oral.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| CEO como único integrador de informação | 28h/semana em operacional |
| Dados em silos (PHC, Excel, WhatsApp) | Decisões com 48–72h de defasagem |
| Sem modelo de capacidade produtiva | Promessas de prazo irrealistas |
| Ausência de histórico de decisões | Repetição de erros estratégicos |

---

## Oportunidades

- Business Twin™ como **fonte única de verdade** para todos os engines executivos.
- Simulação de cenários antes de investir (equipamento, contratação, expansão).
- Benchmark interno mês a mês com indicadores normalizados.
- Base para automações inteligentes com contexto empresarial completo.
- Case study: primeira PME portuguesa com Gêmeo Digital operacional.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Snapshot diário da empresa | 08h00 | Enterprise Brain Runtime gera estado consolidado |
| Alerta de desvio de KPI | KPI < threshold | Executive Watcher notifica responsável |
| Sincronização documental | Novo dado em qualquer área | Atualiza nó correspondente no Twin |
| Relatório de completude | Semanal | CTO reporta % de cobertura do modelo |

---

## Indicadores

| KPI | Atual | Meta Twin (90 dias) |
|---|---|---|
| Cobertura do modelo (% áreas documentadas) | 0% | 100% |
| Freshness dos dados (dias desde atualização) | N/A | <7 dias |
| Accuracy (dados validados vs realidade) | N/A | >90% |
| Decisões apoiadas pelo Twin | 0 | >50 em 90 dias |
| Tempo para gerar snapshot | N/A | <30 segundos |

---

## Responsáveis

| Papel | Pessoa | Função no Twin |
|---|---|---|
| Sponsor | Ricardo Gil (CEO) | Aprova modelo; valida dados |
| Curador de dados | Ana Gil | Finanças, fornecedores, indicadores |
| Curador comercial | Sofia Gil | Clientes, vendas, orçamentos |
| Curador operacional | Paulo Ferreira | Produção, entregas, processos |
| Curador TI | Miguel Santos | Tecnologia, integrações futuras |
| Product Owner SF | Equipa SF Growth AI | Estrutura, engines, evolução |

---

## Integrações futuras

| Sistema | Dados a ingerir | Prioridade | Fase |
|---|---|---|---|
| PHC | Faturação, stocks, compras, clientes | Alta | 60–90 dias |
| Website | Leads, formulários | Média | 30–60 dias |
| Email (Outlook) | Orçamentos, aprovações | Média | 60–90 dias |
| WhatsApp Business API | Operações, instalação | Baixa | 120–180 dias |
| Google Analytics | Tráfego, conversões | Média | 90 dias |
| Contabilidade externa | Balancete, IVA | Alta | 90 dias |

*Nota: integrações são planejadas — esta sprint não implementa APIs.*
