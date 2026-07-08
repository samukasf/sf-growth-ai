# Influence — Aquisição de Clientes

> **Processo:** 01 — Client Acquisition  
> **Documento:** `blueprint/lighthouse/influence/operating-model/01_CLIENT_ACQUISITION.md`  
> **Fases cobertas:** Lead → Reunião → Proposta → Fechamento

---

## Objetivo

Captar, qualificar e converter leads em clientes da Influence Publicidade, garantindo fit comercial, margem mínima e alinhamento estratégico antes do onboarding.

---

## Entradas

- Lead (formulário web, indicação, LinkedIn, evento, inbound)
- Dados de contacto (nome, empresa, email, telefone, segmento)
- Origem do lead (canal, campanha, referrer)
- Histórico de interações anteriores (se existir)
- Capacidade comercial da agência (pipeline atual, slots disponíveis)

---

## Saídas

- Lead qualificado ou descartado (com motivo registado)
- Brief de descoberta da reunião inicial
- Proposta comercial (escopo, investimento, prazo, KPIs)
- Contrato assinado ou proposta arquivada
- Cliente registado no pipeline com owner comercial

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Diretor Comercial (humano) | Aprovação final de propostas acima de €5.000/mês |
| Account Executive | Conduz reunião, elabora proposta, negocia |
| SDR / Prospecção | Qualificação inicial, agendamento |
| CFO (via Conselho) | Valida margem e condições financeiras |
| CLO (via Conselho) | Revisa cláusulas contratuais |
| COO | Valida capacidade operacional de absorver novo cliente |

---

## KPIs

| KPI | Meta |
|---|---|
| Tempo de resposta ao lead | < 2 horas |
| Taxa de conversão lead → reunião | > 35% |
| Taxa de conversão reunião → proposta | > 60% |
| Taxa de conversão proposta → fechamento | > 25% |
| CAC (custo de aquisição) | < 15% do LTV estimado |
| Ciclo médio lead → fechamento | < 21 dias |
| Margem bruta média em novos contratos | > 45% |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Confirmação imediata de lead | Formulário submetido | Email/SMS ao lead + alerta ao SDR |
| Scoring de lead | Lead criado | CRO pontua por segmento, ticket e urgência |
| Alerta de lead frio | Sem contacto > 48h | Executive Inbox escala para Account Executive |
| Geração de proposta | Reunião concluída | Template inteligente com escopo sugerido pelo CSO |
| Validação de margem | Proposta > €3.000/mês | CFO aprova ou devolve com ajuste |
| Follow-up pós-proposta | Proposta enviada + 5 dias | CRO agenda contacto automático |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CRO** | Qualifica leads, prioriza pipeline, sugere abordagem comercial |
| **CMO** | Analisa canal de origem e recomenda investimento em aquisição |
| **CSO** | Valida fit estratégico e propõe escopo inicial |
| **CFO** | Calcula margem, LTV/CAC e condições de pagamento |
| **CLO** | Revisa termos contratuais e cláusulas de rescisão |
| **Samuel AI** | Sintetiza recomendação de fechar ou descartar lead |

---

## Fluxo operacional

```
Lead entra (web · indicação · outbound)
  ↓
SDR qualifica em < 2h (fit · budget · timing)
  ↓
Lead descartado → registo + motivo
Lead qualificado → agendamento de reunião
  ↓
Reunião de descoberta (45–60 min)
  ↓
Brief registado → handoff para Diagnóstico (03)
  ↓
Proposta comercial elaborada (escopo · preço · KPIs)
  ↓
CFO valida margem · CLO valida contrato
  ↓
Proposta enviada ao prospect
  ↓
Negociação (se necessário)
  ↓
Fechamento → contrato assinado → handoff para Onboarding (02)
```

---

## Riscos

- **Lead frio por resposta lenta** — perda de 30–40% dos leads inbound quando resposta excede 4h.
- **Proposta genérica** — escopo mal definido gera retrabalho e insatisfação pós-fechamento.
- **Margem comprimida na negociação** — descontos não validados pelo CFO erodem rentabilidade.
- **Overbooking comercial** — fechar mais clientes do que a capacidade operacional suporta.

---

## Oportunidades

- Scoring automático de leads reduz tempo do SDR em prospects de baixo fit.
- Templates de proposta por vertical (retalho, serviços, imobiliário) aceleram ciclo comercial.
- Playbook de objeções no Executive Knowledge aumenta taxa de fechamento.
- Integração futura com CRM executivo centraliza pipeline multi-cliente da agência.
