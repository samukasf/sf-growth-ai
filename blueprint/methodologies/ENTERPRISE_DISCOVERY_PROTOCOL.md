# Enterprise Discovery Protocol (EDP)

> **Projeto:** Piloto G03 — Enterprise Discovery Protocol  
> **Documento:** `blueprint/methodologies/ENTERPRISE_DISCOVERY_PROTOCOL.md`  
> **Versão:** 1.0 · Julho 2026  
> **Status:** Metodologia oficial do SF Growth AI

---

## O que é o EDP

O **Enterprise Discovery Protocol (EDP)** é a metodologia oficial do SF Growth AI para **descobrir, compreender e modelar qualquer empresa** antes de ativar o Supercérebro.

É utilizado em **todos os novos clientes**, independentemente de setor, porte ou país.

| Relação | Documento / Módulo |
|---|---|
| Implementação técnica | `core/company-discovery/` |
| Método operacional | `blueprint/discovery/DISCOVERY_METHOD.md` |
| Biblioteca de perguntas | `blueprint/methodologies/QUESTION_LIBRARY.md` |
| Fluxo do Samuel | `blueprint/methodologies/DISCOVERY_WORKFLOW.md` |
| Piloto de referência | `blueprint/pilots/grafgil/` |

---

## Princípios do EDP

1. **Nada de suposições** — só o que foi coletado, validado ou inferido com confiança declarada.
2. **Multi-fonte** — nenhuma etapa depende de uma única fonte de informação.
3. **Progressivo** — do macro (identidade) ao micro (automações e ROI).
4. **Reutilizável** — mesmo protocolo para PME, média empresa ou grupo.
5. **Auditável** — cada dado tem origem, confiança e responsável.
6. **Orientado ao Supercérebro** — o output alimenta Business Twin™, Executive Knowledge e Enterprise Brain.

---

## Visão das 10 etapas

```
ETAPA 1  Identidade           → Quem é a empresa?
ETAPA 2  Estrutura             → Como está organizada?
ETAPA 3  Operação              → Como trabalha?
ETAPA 4  Relacionamentos       → Com quem se relaciona?
ETAPA 5  Tecnologia             → Com que sistemas opera?
ETAPA 6  Financeiro             → Como performa economicamente?
ETAPA 7  Marketing             → Como atrai e retém?
ETAPA 8  Diagnóstico            → O que está errado?
ETAPA 9  Oportunidades          → O que pode melhorar?
ETAPA 10 Supercérebro           → Como ativar inteligência executiva?
```

**Duração típica:** 5–15 dias (PME) · 15–45 dias (empresa média) · 45–90 dias (enterprise).

---

# ETAPA 1 — Identidade

> **Objetivo:** Estabelecer quem é a empresa — a fundação de todo o Business Twin™.

## Quem é a empresa?

| Campo | Descrição | Fontes |
|---|---|---|
| **Nome** | Razão social, nome comercial, nomes alternativos | ERP, contrato social, website |
| **Marca** | Logo, identidade visual, posicionamento percebido | Website, redes sociais, materiais |
| **História** | Fundação, marcos, evolução, crises superadas | Entrevistas, documentos, fundadores |
| **Missão** | Por que a empresa existe | Questionário, entrevista CEO |
| **Valores** | Valores declarados vs valores vividos | Questionário, cultura observada |
| **Segmento** | Setor, subsegmento, categoria de mercado | Website, ERP, concorrentes |
| **País** | Sede, filiais, jurisdição legal | ERP, contrato social |
| **Idiomas** | Idiomas de operação e comunicação | Website, equipa, clientes |
| **Mercados** | Geografias atendidas, exportação, expansão | CRM, comercial, estratégia |

## Output da Etapa 1

- Ficha de identidade no `CompanyProfile` (secção `identity`)
- Score de completude: mínimo 70% para avançar
- Lacunas: missão/valores não documentados, mercados não mapeados

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Nome e razão social confirmados | 100% |
| Segmento definido | Sim |
| Missão documentada | Sim (mesmo que preliminar) |
| Mercados principais identificados | ≥1 |

---

# ETAPA 2 — Estrutura Organizacional

> **Objetivo:** Mapear quem decide, quem executa e como a hierarquia funciona.

## Componentes

| Componente | O que mapear |
|---|---|
| **Sócios** | Nomes, quotas, papel operacional vs estratégico |
| **Diretores** | C-level, conselho, decisores finais |
| **Gerentes** | Heads de departamento, reporte, autonomia |
| **Departamentos** | Lista completa, função, headcount |
| **Funcionários** | Total, tipos de contrato, turnos, localização |
| **Terceiros** | Freelancers, consultores, outsourcing, parceiros operacionais |
| **Hierarquia** | Organograma, matriz RACI simplificada, gargalos de aprovação |

## Output da Etapa 2

- Organograma digital no Business Twin™
- Mapa de responsáveis por área (alimenta Conselho Executivo Digital)
- Identificação de gargalos humanos (ex.: CEO aprova tudo)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Organograma até nível de departamento | 100% |
| Responsáveis nomeados por área | ≥80% |
| Headcount total validado | Sim |

---

# ETAPA 3 — Operação

> **Objetivo:** Compreender como a empresa transforma input em valor — o coração operacional.

## Dimensões

| Dimensão | Perguntas-chave |
|---|---|
| **Como trabalha** | Ritmo, turnos, sazonalidade, picos, capacidade |
| **Como atende** | Canais, SLAs, reclamações, NPS |
| **Como vende** | Funil, ciclo, conversão, pipeline |
| **Como produz** | Processo produtivo, QC, retrabalho, OTD |
| **Como compra** | Fornecedores, prazos, negociação, stock |
| **Como entrega** | Logística, instalação, pós-venda |

## Output da Etapa 3

- Mapa de processos críticos (Order-to-Cash mínimo)
- SLAs documentados ou inferidos
- Indicadores operacionais baseline (OTD, conversão, lead time)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Processos críticos mapeados | ≥5 |
| Ciclo comercial documentado | Sim |
| Ciclo operacional documentado | Sim |

---

# ETAPA 4 — Relacionamentos

> **Objetivo:** Mapear o ecossistema externo da empresa.

## Entidades

| Entidade | Dados a coletar |
|---|---|
| **Clientes** | Segmentos, volume, recorrência, concentração, LTV, churn |
| **Fornecedores** | Top fornecedores, dependência, prazos, riscos |
| **Parceiros** | Agências, revendedores, integradores, joint ventures |
| **Concorrentes** | Diretos, indiretos, posicionamento, diferenciação |

## Output da Etapa 4

- Carteira de clientes segmentada
- Mapa de fornecedores com score de dependência
- Landscape competitivo (Inteligência de Mercado)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Top 10 clientes identificados | Sim |
| Top 5 fornecedores identificados | Sim |
| ≥3 concorrentes mapeados | Sim |

---

# ETAPA 5 — Tecnologia

> **Objetivo:** Inventariar o stack tecnológico e identificar silos de dados.

## Inventário

| Sistema | Status | Integração |
|---|---|---|
| **Site** | URL, CMS, formulários, analytics | Com CRM? |
| **CRM** | Ferramenta, adoção, pipeline | Com ERP? |
| **ERP** | Módulos ativos, utilização | Com financeiro? |
| **WhatsApp** | Uso operacional vs comercial | Estruturado? |
| **Email** | Provider, templates, automação | Com CRM? |
| **Google** | Ads, Analytics, Business Profile | Tracking? |
| **Meta** | Facebook, Instagram, Ads | ROI medido? |
| **Redes sociais** | Canais ativos, frequência | Integrado? |
| **Integrações** | APIs, Zapier, manual, nenhuma | Mapa completo |

## Output da Etapa 5

- Stack map no Business Twin™
- Índice de fragmentação de dados (0–100)
- Lista de integrações prioritárias

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Todos os sistemas listados | 100% |
| Responsável TI identificado | Sim |
| Mapa de integrações (mesmo que vazio) | Sim |

---

# ETAPA 6 — Financeiro

> **Objetivo:** Estabelecer baseline econômico para decisões do CFO digital.

## Componentes

| Componente | Indicadores |
|---|---|
| **Receitas** | Faturação, mix, recorrência, sazonalidade, concentração |
| **Custos** | COGS, operacionais, fixos vs variáveis, por departamento |
| **Margens** | Bruta, líquida, por produto/cliente/projeto |
| **Indicadores** | EBITDA, DSO, DPO, inadimplência, break-even |
| **Fluxo de Caixa** | Caixa atual, projeção, sazonalidade, investimentos |

## Output da Etapa 6

- Snapshot financeiro no Enterprise Brain Runtime
- Margem por linha de produto (ou estimativa)
- Alertas financeiros configuráveis (Executive Watchers)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Faturação últimos 12 meses | Sim |
| Margem bruta estimada | Sim |
| DSO ou proxy de cobrança | Sim |

---

# ETAPA 7 — Marketing

> **Objetivo:** Compreender como a empresa atrai, converte e retém clientes.

## Dimensões

| Dimensão | Métricas |
|---|---|
| **Aquisição** | Canais, CAC, volume de leads, custo por canal |
| **Conversão** | Funil, taxa por etapa, tempo de ciclo |
| **Retenção** | Churn, NPS, recompra, LTV |
| **Reputação** | Reviews, menções, Google Business, reclamações |
| **Google Business** | Rating, volume de reviews, fotos, posts |

## Output da Etapa 7

- Mapa de canais com ROI estimado
- Baseline de CAC e conversão
- Plano de otimização para CMO digital

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| Canais de aquisição listados | ≥3 |
| Taxa de conversão estimada | Sim |
| Presença digital avaliada | Sim |

---

# ETAPA 8 — Diagnóstico

> **Objetivo:** Identificar o que impede a empresa de crescer — base para o Conselho Executivo.

## Categorias

| Categoria | O que identificar |
|---|---|
| **Problemas** | Dores declaradas pelo CEO e equipa |
| **Gargalos** | Pontos onde o fluxo para (pessoas, processos, sistemas) |
| **Riscos** | Financeiros, operacionais, legais, de mercado, de pessoas |
| **Fraquezas** | Gaps competitivos, dependências, falta de dados |

## Output da Etapa 8

- Lista priorizada de problemas (severity: low → critical)
- Mapa de gargalos com impacto estimado em € ou horas
- Registo de riscos no Executive Watchers (futuro)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| ≥5 problemas documentados | Sim |
| ≥3 gargalos identificados | Sim |
| ≥3 riscos mapeados | Sim |

---

# ETAPA 9 — Oportunidades

> **Objetivo:** Transformar diagnóstico em plano de ação com ROI — alimenta Executive Innovation e Project Generator.

## Tipos de oportunidade

| Tipo | Exemplos |
|---|---|
| **Projetos** | Novos produtos, expansão geográfica, rebranding |
| **Automações** | Follow-up, faturação, alertas, relatórios |
| **Softwares** | CRM, portal do cliente, integrações ERP |
| **Apps** | App de campo, configurador, self-service |
| **ROI** | Business case por oportunidade, payback, priorização |

## Output da Etapa 9

- Pipeline de oportunidades com tier (1/2/3)
- Business case para top 5 oportunidades
- Lista de automações quick-win (0–30 dias)

## Critérios de qualidade

| Critério | Mínimo aceitável |
|---|---|
| ≥8 oportunidades identificadas | Sim |
| ROI estimado para top 3 | Sim |
| ≥3 automações quick-win | Sim |

---

# ETAPA 10 — Supercérebro

> **Objetivo:** Calcular maturidade, definir prioridades executivas e ativar o Supercérebro.

## Scores oficiais

| Score | Escala | O que mede |
|---|---|---|
| **Enterprise Maturity Score** | 0–100 | Maturidade geral de gestão e dados |
| **Digital Maturity** | 0–100 | Digitalização de processos e canais |
| **Automation Score** | 0–100 | Grau de automação vs trabalho manual |
| **AI Readiness** | 0–100 | Prontidão para operar com Supercérebro |
| **Business Health** | 0–100 | Saúde financeira e operacional combinada |

## Fórmula conceitual

```
Enterprise Maturity Score =
  (Identidade × 10% + Estrutura × 10% + Operação × 15% +
   Relacionamentos × 10% + Tecnologia × 15% + Financeiro × 15% +
   Marketing × 10% + Diagnóstico × 5% + Oportunidades × 10%)
  normalizado para 0–100
```

## Executive Priorities

Após os scores, Samuel AI define **3 prioridades executivas** para os primeiros 90 dias:

1. **Quick win** — resultado visível em <30 dias
2. **Fundação** — dados, processos ou integrações críticas
3. **Estratégico** — oportunidade de maior ROI no horizonte 12 meses

## Roadmap

| Horizonte | Foco |
|---|---|
| **30 dias** | Visibilidade — briefing diário, watchers, perfil base |
| **90 dias** | Inteligência — automações, integrações, Conselho ativo |
| **180 dias** | Execução — projetos, ROI mensurável, Twin vivo |
| **365 dias** | Escala — modelo replicável, expansão de módulos |

## Output da Etapa 10

- `DiscoveryScore` completo no `core/company-discovery/`
- Relatório executivo de descoberta
- Roadmap personalizado
- Go-live do Supercérebro (ou plano de ativação faseado)

## Critérios de go-live

| Critério | Mínimo para ativar Supercérebro |
|---|---|
| Enterprise Maturity Score | ≥50 |
| AI Readiness | ≥40 |
| CompanyProfile completeness | ≥60% |
| Executive Priorities definidas | 3 |
| Responsável interno (champion) | Nomeado |

---

## Governança do EDP

| Papel | Responsabilidade |
|---|---|
| **CEO / Empresário** | Sponsor, validação final, rituais |
| **Samuel AI** | Conduz descoberta, sintetiza, recomenda |
| **Champion interno** | Fornece dados, facilita acesso |
| **Equipa SF Growth AI** | Configuração, suporte, evolução |

## Entregáveis finais do EDP

1. `CompanyProfile` completo (Business Twin™)
2. Relatório de descoberta com scores
3. Mapa de lacunas e oportunidades
4. Roadmap executivo 30/90/180/365 dias
5. Plano de ativação do Supercérebro

---

## Documentos relacionados

- [QUESTION_LIBRARY.md](./QUESTION_LIBRARY.md) — perguntas por etapa
- [DISCOVERY_WORKFLOW.md](./DISCOVERY_WORKFLOW.md) — como Samuel conduz o EDP
- [../discovery/DISCOVERY_METHOD.md](../discovery/DISCOVERY_METHOD.md) — implementação técnica
- [../pilots/grafgil/MASTER_MAP.md](../pilots/grafgil/MASTER_MAP.md) — exemplo de empresa modelada

---

> *"Conhecer antes de administrar. Modelar antes de decidir. Descobrir antes de escalar."*  
> — Enterprise Discovery Protocol, SF Growth AI
