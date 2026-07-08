# Influence — Mídia Paga

> **Processo:** 07 — Paid Media  
> **Documento:** `blueprint/lighthouse/influence/operating-model/07_PAID_MEDIA.md`

---

## Objetivo

Planear, configurar, otimizar e reportar campanhas de mídia paga (Meta Ads, Google Ads, LinkedIn Ads) com foco em ROI, CPA e ROAS acordados com o cliente.

---

## Entradas

- Budget de mídia do plano estratégico (processo 04)
- Peças criativas aprovadas (processo 06)
- Públicos-alvo e personas (Company Brain)
- Contas de ads do cliente (acessos provisionados no onboarding)
- Histórico de campanhas e benchmarks do setor
- Landing pages ou destinos de conversão

---

## Saídas

- Campanhas ativas e otimizadas
- Relatório de performance semanal
- Recomendações de realocação de budget
- Testes A/B documentados
- Dados de conversão para relatório mensal (processo 12)

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Media Buyer / Especialista de mídia | Configuração, otimização e gestão diária |
| Account Manager | Comunicação de resultados ao cliente |
| Analista de dados | Tracking, atribuição e relatórios |
| Diretor de mídia | Estratégia de canais e alocação de budget |
| CFO (via Conselho) | Valida ROI e alerta sobre burn rate |

---

## KPIs

| KPI | Meta |
|---|---|
| ROAS | ≥ acordado por campanha |
| CPA | ≤ target definido no plano |
| CTR | Acima da média do setor |
| Frequência de otimização | Diária (campanhas ativas) |
| Desvio de budget vs. planeado | < 10% |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Alerta de CPA elevado | CPA > 120% do target | Media buyer ajusta ou pausa campanha |
| Realocação sugerida | Canal com ROAS 2× superior | CMO recomenda shift de budget |
| Relatório semanal | Segunda-feira 09:00 | CDO gera snapshot de performance |
| Alerta de budget esgotado | 90% do budget mensal consumido | CFO notifica Account Manager |
| Detecção de anúncio rejeitado | Policy violation | Alerta imediato ao media buyer |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CMO** | Define estratégia de canais, públicos e criativos |
| **CDO** | Analisa dados, atribuição e performance |
| **CFO** | Monitora burn rate, ROI e viabilidade financeira |
| **CRO** | Alinha campanhas com metas de conversão e vendas |
| **Samuel AI** | Sintetiza performance e recomenda ajustes ao empresário |

---

## Fluxo operacional

```
Budget e estratégia definidos (processo 04)
  ↓
Setup de campanhas (estrutura · públicos · criativos)
  ↓
Tracking e pixels validados (CTO)
  ↓
Lançamento → monitorização diária
  ↓
Otimização contínua (lances · públicos · criativos)
  ↓
Testes A/B de criativos e landing pages
  ↓
Relatório semanal → consolidação no mensal (12)
  ↓
Recomendações de upsell ou realocação (15)
```

---

## Riscos

- **Tracking incorreto** — decisões de otimização baseadas em dados errados.
- **Budget burn sem conversões** — campanha ativa consome verba sem ROI.
- **Creative fatigue** — mesmas peças por tempo prolongado degradam performance.
- **Dependência de um canal** — 80% do budget numa plataforma cria risco de concentração.

---

## Oportunidades

- Playbooks de campanha por vertical reutilizáveis entre clientes.
- Watchers de mercado alertam sobre mudanças de CPC/CPM no setor.
- Automação de rules (pausar, escalar) reduz tempo manual do media buyer.
- Benchmark cross-cliente (anonimizado) melhora targets de ROAS.
