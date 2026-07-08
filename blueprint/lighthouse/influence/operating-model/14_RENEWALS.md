# Influence — Renovações

> **Processo:** 14 — Renewals  
> **Documento:** `blueprint/lighthouse/influence/operating-model/14_RENEWALS.md`

---

## Objetivo

Garantir renovação contratual de clientes ativos da Influence, demonstrando ROI entregue e propondo evolução de escopo para o próximo ciclo.

---

## Entradas

- Contrato atual (data de término, escopo, valor)
- Histórico de relatórios mensais (processo 12)
- Health score do cliente (processo 13)
- ROI documentado no período
- Feedback do empresário
- Pipeline de upsell identificado (processo 15)

---

## Saídas

- Proposta de renovação (escopo · valor · prazo)
- Contrato renovado ou plano de offboarding (17)
- Baseline de KPIs para novo ciclo
- Registo na Executive Memory

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Account Manager | Conduz processo de renovação com cliente |
| Diretor Comercial | Aprova condições e descontos |
| CRO (via Conselho) | Estratégia de renovação e pricing |
| CFO | Valida margem da proposta de renovação |
| CCO | Garante que experiência suporta renovação |

---

## KPIs

| KPI | Meta |
|---|---|
| Taxa de renovação | > 85% |
| Início do processo antes do término | 60 dias |
| Taxa de upsell na renovação | > 30% |
| Tempo médio renovação (proposta → assinatura) | < 14 dias |
| Churn evitável | < 5% da carteira |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Alerta de renovação | 60 dias antes do término | CRO notifica Account Manager |
| Dossier de renovação | 45 dias antes | CDO compila ROI e resultados do período |
| Proposta automática | 30 dias antes | CRO gera draft com escopo sugerido |
| Alerta de risco | Health score < 60 | Prioriza intervenção antes de renovação |
| Follow-up | Proposta enviada + 7 dias | Lembrete automático ao Account Manager |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CRO** | Estratégia de renovação, pricing e negociação |
| **CFO** | Valida margem e condições financeiras |
| **CCO** | Avalia se experiência suporta renovação |
| **CDO** | Compila ROI e evidências de valor entregue |
| **Samuel AI** | Sintetiza dossier e recomenda abordagem ao empresário |

---

## Fluxo operacional

```
Alerta 60 dias antes do término do contrato
  ↓
Account Manager + CSM avaliam health score (13)
  ↓
CDO compila dossier de ROI (relatórios 12 · KPIs · cases)
  ↓
CRO elabora proposta de renovação (escopo · preço · upsell)
  ↓
CFO valida margem · Diretor Comercial aprova
  ↓
Reunião de renovação com empresário
  ↓
Negociação (se necessário)
  ↓
Contrato renovado → novo ciclo de planejamento (04)
  ou
Não renovado → retenção (16) ou offboarding (17)
```

---

## Riscos

- **Processo iniciado tarde** — menos de 30 dias para renovação comprime negociação.
- **ROI não documentado** — cliente não percebe valor entregue e recusa renovação.
- **Proposta idêntica ao ciclo anterior** — falta de evolução desmotiva cliente.
- **Health score ignorado** — tentativa de renovar cliente já decidido a sair.

---

## Oportunidades

- Renovação como momento natural de upsell (15) com dossier de oportunidades.
- Dossier automático de ROI reduz trabalho manual do Account Manager.
- Taxa de renovação como KPI principal da Agency Platform.
- Clientes renovados com escopo expandido aumentam LTV da agência.
