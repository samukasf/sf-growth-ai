# Grafgil — Oportunidades de Software

> **Documento:** `blueprint/pilots/grafgil/15_SOFTWARE_OPPORTUNITIES.md`  
> **Piloto:** G01 — Grafgil Enterprise Blueprint

---

## Situação Atual

O stack tecnológico da Grafgil é mínimo e desintegrado:

| Sistema | Função | Integração | Satisfação |
|---|---|---|---|
| **PHC** | ERP (faturação, compras, stocks) | Nenhuma | 5/10 |
| **Excel** | CRM, pipeline, caixa, relatórios | Nenhuma | 3/10 |
| **Email (Outlook)** | Comunicação comercial e clientes | Nenhuma | 6/10 |
| **WhatsApp** | Operações e instalação | Nenhuma | 4/10 |
| **Website WordPress** | Vitrine estática | Formulário → email | 3/10 |
| **Canva** | Propostas visuais | Manual | 7/10 |

**Miguel Santos** (TI part-time, 16h/semana) gere tudo sem roadmap tecnológico.

---

## Problemas

1. **Silos de dados** — mesma informação em 4 sistemas diferentes.
2. **PHC subutilizado** — módulos de produção e stocks parcialmente ativos.
3. **Sem CRM** — pipeline em Excel; sem histórico pesquisável.
4. **Website obsoleto** — não gera leads qualificados.
5. **Sem portal do cliente** — aprovação de provas por email.
6. **Zero integrações** — tudo copy-paste entre sistemas.

---

## Oportunidades de software

### Prioridade 1 — SF Growth AI (Supercérebro)

| Módulo | Função | Substituir |
|---|---|---|
| Samuel AI | CEO digital, briefing, decisões | Reuniões ad-hoc + Excel CEO |
| Executive Council | Deliberação multi-domínio | Conselho inexistente |
| Enterprise Brain Runtime | Visão unificada | 5 fontes manuais |
| Executive Watchers | Alertas automáticos | Verificação manual |
| Executive Inbox | Aprovações centralizadas | Email disperso |
| Executive Memory | Memória institucional | Conhecimento tribal |
| Executive Knowledge | SOPs, catálogo, fornecedores | Documentos dispersos |

### Prioridade 2 — Integrações

| Integração | De → Para | Impacto |
|---|---|---|
| PHC → Supercérebro | Faturação, stocks, compras | Dados financeiros em tempo real |
| Website → Supercérebro | Leads do formulário | Resposta automática |
| Email → Supercérebro | Orçamentos, aprovações | Pipeline unificado |
| Supercérebro → PHC | Encomendas aprovadas | Elimina reentrada |

### Prioridade 3 — Software complementar (futuro)

| Software | Função | Quando |
|---|---|---|
| Portal do cliente | Aprovação de provas, tracking | Dia 90–120 |
| CRM leve (ou módulo SF) | Pipeline comercial | Dia 60 |
| App de instalação | Foto, GPS, assinatura | Dia 120–180 |
| Configurador de orçamentos | Self-service preliminar | Dia 180–365 |

---

## Como o Supercérebro atuará

| Papel | Atuação tecnológica |
|---|---|
| **CTO (Conselho)** | Define roadmap de integrações; prioriza por ROI |
| **Software Factory** | Gera protótipos de portal e app quando aprovado |
| **Executive Orchestrator** | Orquestra fluxos entre SF Growth AI e PHC |
| **Executive Project Generator** | Plano de implementação por fase com marcos |
| **Executive Memory** | Regista decisões técnicas e lições aprendidas |

**Decisão de arquitetura:** SF Growth AI é a camada de inteligência; PHC permanece como ERP de registo. Não substituir PHC — integrar.

---

## Impacto esperado

| Métrica | Atual | Meta 12 meses |
|---|---|---|
| Sistemas integrados | 0 | 4 |
| Fontes de dados para decisão | 5 manuais | 1 (Supercérebro) |
| Tempo de implementação TI | Ad-hoc | Roadmap trimestral |
| Leads do website qualificados | 4/mês | 18/mês |
| Reentrada de dados | 12h/sem | 2h/sem |

---

## ROI esperado

| Investimento | Custo | Retorno anual |
|---|---|---|
| SF Growth AI (licença + setup) | €18.000 | €145.000 (consolidado) |
| Integração PHC | €4.000 | €32.000 |
| Website novo + SEO | €8.000 | €48.000 |
| Portal do cliente (fase 2) | €6.000 | €35.000 |
| **Total software** | **€36.000** | **€260.000** |

**ROI:** 622%
