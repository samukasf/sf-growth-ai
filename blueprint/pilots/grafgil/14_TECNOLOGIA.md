# Grafgil Digital Twin — Tecnologia

> **Camada:** Business Twin™ — Stack e infraestrutura  
> **Documento:** `blueprint/pilots/grafgil/14_TECNOLOGIA.md`

---

## Estado Atual

| Sistema | Função | Integração | Satisfação |
|---|---|---|---|
| PHC | ERP (faturação, compras, stocks parcial) | Nenhuma | 5/10 |
| Excel | CRM, pipeline, caixa, relatórios | Nenhuma | 3/10 |
| Outlook | Email comercial e admin | Nenhuma | 6/10 |
| WhatsApp | Operações, instalação | Nenhuma | 4/10 |
| WordPress | Website estático | Formulário → email | 3/10 |
| Canva | Propostas visuais | Manual | 7/10 |
| Servidor local | Ficheiros, backups | Manual | 5/10 |

**TI:** Miguel Santos — 16h/semana — sem roadmap tecnológico.

---

## Objetivos

1. SF Growth AI como camada de inteligência sobre o stack existente.
2. Integrar PHC com Supercérebro (fase 60–90 dias).
3. Eliminar reentrada de dados entre sistemas.
4. Definir roadmap tecnológico trimestral.
5. Garantir backups testados e política de segurança básica.

---

## Problemas

- 6 sistemas isolados — zero integrações.
- PHC subutilizado (produção e stocks parciais).
- Backups não testados regularmente.
- Sem política de segurança formalizada.
- Miguel sobrecarregado — 16h insuficientes para integrações.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Zero integrações | 12h/semana em copy-paste |
| TI part-time | Roadmap sempre adiado |
| Backups não testados | Risco de perda de dados |

---

## Oportunidades

- SF Growth AI como hub de inteligência (não substituir PHC).
- 4 integrações prioritárias: PHC, website, email, analytics.
- Portal do cliente (fase 2) via Software Factory.
- App de instalação (fase 2).
- Automações via Executive Watchers sem código custom.

---

## Automações possíveis

| Automação | Sistema | Ação |
|---|---|---|
| Ingestão PHC | PHC → Twin | Snapshot financeiro e stocks |
| Lead web → Twin | Website → Supercérebro | Lead qualificado automático |
| Backup check | Semanal | Alerta se backup falhou |
| Relatório de completude | Semanal | % cobertura do Twin |
| Sync orçamento | Email → Twin | Regista proposta no pipeline |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Sistemas integrados | 0 | 4 |
| Reentrada de dados | 12h/sem | 2h/sem |
| Backups testados | 0% | 100% (mensal) |
| Uptime PHC | ~98% | 99,5% |
| Cobertura do Twin | 0% | 100% (90 dias) |

---

## Responsáveis

| Função | Responsável |
|---|---|
| TI e integrações | Miguel Santos |
| ERP (PHC) | Ana Gil (admin) + Miguel |
| Segurança e backups | Miguel Santos |
| Curadoria no Twin | CTO + CBO |
| Roadmap tecnológico | Ricardo Gil + CTO |

---

## Integrações futuras

| Integração | Prioridade | Fase |
|---|---|---|
| PHC → Enterprise Brain | Alta | 60–90 dias |
| Website → Supercérebro | Média | 30–60 dias |
| Outlook → Pipeline | Média | 60–90 dias |
| Google Analytics → CMO | Média | 90 dias |
| WhatsApp Business API | Baixa | 120–180 dias |
| Portal do cliente | Média | 90–120 dias |
| App de instalação | Baixa | 120–180 dias |

*Esta sprint documenta apenas — nenhuma API é implementada.*
