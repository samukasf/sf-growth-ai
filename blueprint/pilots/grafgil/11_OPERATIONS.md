# Grafgil — Operações e Produção

> **Documento:** `blueprint/pilots/grafgil/11_OPERATIONS.md`  
> **Piloto:** G01 — Grafgil Enterprise Blueprint

---

## Situação Atual

A operação da Grafgil funciona em 2 turnos (08h–17h e 17h–22h em picos), com 18 colaboradores de produção.

### Indicadores operacionais

| KPI | Valor atual |
|---|---|
| Jobs/mês | ~195 |
| OTD (on-time delivery) | 82% |
| Taxa de retrabalho | 11% |
| Utilização de máquinas | 68% |
| Desperdício de material | 7,2% |
| Tempo médio de setup | 42 min |
| Capacidade máxima (jobs/mês) | ~240 |
| Instalações/mês | 28 |

### Layout

- Zona de pré-impressão e arte-final
- 2 linhas de impressão UV
- Zona de corte CNC e plotter
- Laminagem e acabamentos
- Armazém de materiais (180m²)
- Expedição e cargas

---

## Problemas

1. **Planeamento manual** — quadro branco; sem visão de capacidade vs demanda.
2. **Retrabalho elevado** — 11% dos jobs refeitos por erro de ficheiro, cor ou especificação.
3. **Desperdício de material** — 7,2%; acima do benchmark setorial (4–5%).
4. **Gargalos invisíveis** — CNC é bottleneck em 30% dos dias; descoberto tarde.
5. **Instalação descoordenada** — agendamento por WhatsApp; revisitas em 15% dos casos.
6. **Manutenção reativa** — máquinas param sem aviso; sem plano preventivo.

---

## Oportunidades

1. **Planeamento assistido por IA** — COO cruza encomendas confirmadas com capacidade.
2. **QC digital obrigatório** — checklist antes de libertar cada job.
3. **Otimização de nesting/corte** — reduzir desperdício de material.
4. **Manutenção preventiva** — calendário com alertas antes de avarias.
5. **Tracking de instalação** — app simples com foto, GPS e assinatura do cliente.
6. **Gestão de capacidade dinâmica** — comercial vê disponibilidade real antes de prometer prazo.

---

## Como o Supercérebro atuará

| Componente | Atuação operacional |
|---|---|
| **COO (Conselho)** | OTD, capacidade, retrabalho, desperdício, instalações |
| **Enterprise Brain Runtime** | Estado da produção em tempo real no briefing |
| **Executive Watchers** | Job em risco de atraso; stock crítico; máquina parada |
| **Executive Knowledge** | SOPs de produção, specs de materiais, tempos padrão |
| **Executive Orchestrator** | "Cumprir todos os prazos esta semana" → replaneamento |
| **CTO** | Integração com máquinas (fase 2); automações de alerta |

**Regra operacional:** Nenhum job urgente entra em produção sem QC de ficheiro aprovado digitalmente.

---

## Impacto esperado

| Métrica | Atual | Meta 12 meses |
|---|---|---|
| OTD | 82% | 94% |
| Retrabalho | 11% | 6% |
| Desperdício de material | 7,2% | 4,5% |
| Utilização de máquinas | 68% | 82% |
| Revisitas de instalação | 15% | 5% |
| Paragens não planeadas | 8/mês | 3/mês |

---

## ROI esperado

| Ganho | Valor anual |
|---|---|
| Redução de retrabalho (−5 pp × custo médio) | €42.000 |
| Redução de desperdício (−2,7 pp × €280k materiais) | €18.000 |
| Mais capacidade sem investir (+14 pp utilização) | €65.000 receita |
| Menos revisitas de instalação | €8.500 |
| Menos paragens (manutenção preventiva) | €12.000 |
| **Total operações** | **€145.500** |

**ROI:** 708%
