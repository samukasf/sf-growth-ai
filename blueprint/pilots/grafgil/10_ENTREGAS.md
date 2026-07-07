# Grafgil Digital Twin — Entregas

> **Camada:** Business Twin™ — Logística e instalação  
> **Documento:** `blueprint/pilots/grafgil/10_ENTREGAS.md`

---

## Estado Atual

| Modalidade | % Jobs | Prazo médio | No prazo |
|---|---|---|---|
| Levantamento no armazém | 35% | Mesmo dia | 95% |
| Entrega por transportadora | 40% | 1–2 dias | 88% |
| Instalação no local | 25% | 3–7 dias após produção | 76% |

**Equipa instalação:** 3 técnicos · Agendamento por WhatsApp · 15% revisitas · Sem registo fotográfico sistemático.

---

## Objetivos

1. Atingir 90% de instalações no prazo.
2. Reduzir revisitas de 15% para <5%.
3. Implementar tracking com foto, GPS e assinatura digital.
4. Coordenar entrega + instalação + faturação num fluxo único.
5. Modelar capacidade de instalação no Twin (28/mês atual, max ~35).

---

## Problemas

- Agendamento manual por WhatsApp — conflitos de agenda.
- 15% revisitas (medições erradas, material em falta, acesso negado).
- Cliente não sabe quando instalação está marcada até ligar.
- Sem prova de conclusão (foto/assinatura) — disputas em 3% dos casos.
- Expedição descoordenada com produção (produto pronto, sem transporte agendado).

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Agendamento manual | 3h/semana + conflitos |
| Medições incorretas | 15% revisitas |
| Sem app de campo | Zero rastreabilidade |

---

## Oportunidades

- App de instalação: foto + GPS + assinatura.
- Agendamento automático quando job concluído na produção.
- Serviço premium: instalação noturna (sem interromper operação do cliente).
- Notificação proativa ao cliente (SMS/email com janela de instalação).
- Rede de instaladores parceiros para picos (fase 2).

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Agendamento | Job pronto + instalação requerida | Propõe slot + confirma com cliente |
| Notificação cliente | Instalação confirmada | SMS/email com data e técnico |
| Registo de conclusão | Instalação finalizada | Foto + assinatura → dispara faturação |
| Alerta revisita | Instalação incompleta | COO agenda revisit + regista causa |
| Confirmação de entrega | Transportadora entrega | Update automático no Twin |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Instalações no prazo | 76% | 90% |
| Revisitas | 15% | 5% |
| Entregas no prazo (global) | 88% | 96% |
| Disputas pós-instalação | 3% | <1% |
| Tempo médio instalação→faturação | 2,3 dias | Mesmo dia |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Instalação | Paulo Ferreira + 3 técnicos |
| Expedição e transporte | Armazém |
| Agendamento | Assistente comercial |
| Curadoria no Twin | COO |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| App de instalação (fase 2) | GPS, fotos, assinaturas |
| Transportadoras | Tracking de envios |
| PHC | Faturação pós-conclusão |
| Executive Watchers | Alertas de atraso |
| SMS/Email | Notificações ao cliente |
