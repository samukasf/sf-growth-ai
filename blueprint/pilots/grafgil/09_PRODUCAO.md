# Grafgil Digital Twin — Produção

> **Camada:** Business Twin™ — Chão de fábrica  
> **Documento:** `blueprint/pilots/grafgil/09_PRODUCAO.md`

---

## Estado Atual

| KPI | Valor |
|---|---|
| Jobs/mês | ~195 |
| Capacidade máxima | ~240 jobs/mês |
| Utilização de máquinas | 68% |
| OTD (on-time delivery) | 82% |
| Taxa de retrabalho | 11% |
| Desperdício de material | 7,2% |
| Tempo médio de setup | 42 min |
| Turnos | 08h–17h (+17h–22h em picos) |

**Equipamento:** 2 impressoras UV · 1 CNC (bottleneck 30% dos dias) · 1 plotter · 1 laminadora.

Planeamento em quadro branco. QC com checklist papel (40% dos jobs urgentes ignoram).

---

## Objetivos

1. Atingir OTD >94% e retrabalho <6%.
2. Reduzir desperdício de material para <4,5%.
3. Aumentar utilização de máquinas para 82% sem investimento.
4. Implementar QC digital obrigatório em 100% dos jobs.
5. Modelar capacidade produtiva no Twin para promessas de prazo realistas.

---

## Problemas

- Planeamento manual — sem visão de capacidade vs demanda.
- Retrabalho 11% (erros de ficheiro, cor, especificação).
- CNC como bottleneck não visível até tarde.
- Desperdício 7,2% (benchmark setorial: 4–5%).
- Manutenção reativa — 8 paragens não planeadas/mês.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| CNC (fila 30% dos dias) | Atrasos em 18% dos jobs |
| Pré-impressão (João) | Dependência de 1 pessoa |
| QC ignorado em urgentes | Retrabalho + reclamações |

---

## Oportunidades

- Planeamento assistido: pipeline comercial + capacidade + stock.
- QC digital obrigatório (tablet) antes de libertar job.
- Otimização de nesting/corte (−2,7 pp desperdício).
- Manutenção preventiva com calendário e alertas.
- Segundo turno estruturado em picos (Q2, Q4).

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Planeamento de jobs | Encomendas confirmadas | COO sugere sequência ótima |
| Alerta atraso | Job em risco >24h | Notifica COO + comercial |
| QC obrigatório | Job pronto para produção | Bloqueia sem checklist digital |
| Manutenção preventiva | Horas máquina > threshold | Alerta CTO + Paulo |
| Alerta stock material | Material insuficiente | Bloqueia job + pede reposição |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| OTD | 82% | 94% |
| Retrabalho | 11% | 6% |
| Desperdício material | 7,2% | 4,5% |
| Utilização máquinas | 68% | 82% |
| Paragens não planeadas | 8/mês | 3/mês |
| QC digital | 0% | 95% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Produção e planeamento | Paulo Ferreira |
| Pré-impressão | João (operador-chave) |
| QC | Responsável de qualidade |
| Curadoria no Twin | COO + Executive Knowledge |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| PHC (módulo produção) | Jobs, tempos, materiais |
| Executive Watchers | Alertas de atraso e stock |
| Máquinas (fase 2) | Telemetria de utilização |
| Comercial / Pipeline | Demanda futura para planeamento |
