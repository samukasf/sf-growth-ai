# Grafgil Digital Twin — Financeiro

> **Camada:** Business Twin™ — Saúde financeira  
> **Documento:** `blueprint/pilots/grafgil/11_FINANCEIRO.md`

---

## Estado Atual

| Indicador | Valor |
|---|---|
| Faturação anual | €2.800.000 |
| Margem bruta | 42% |
| EBITDA | €336.000 (12%) |
| Caixa disponível | €185.000 |
| DSO (dias de cobrança) | 47 dias |
| DPO (dias de pagamento) | 38 dias |
| Inadimplência >30 dias | 9% (€42.000) |
| Compras anuais | €980.000 |
| Investimento equipamento (último ano) | €45.000 |

**Sistemas:** PHC (faturação, compras) · Excel (caixa, projeções) · Contabilista externo (part-time).

---

## Objetivos

1. Margem bruta por projeto visível em tempo real.
2. DSO reduzido para 32 dias com cobrança automatizada.
3. Inadimplência <4% com política de crédito formal.
4. Fluxo de caixa preditivo a 90 dias.
5. Budget departamental com alertas de desvio.

---

## Problemas

- Margem por projeto só calculada no fecho mensal.
- Cobrança reativa — contacto após 45 dias de atraso.
- Sem política de crédito por cliente.
- Projeção de caixa manual e imprecisa.
- Investimentos sem business case formal.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Faturação com atraso (2,3 dias pós-entrega) | DSO elevado |
| Cobrança manual | €42k em inadimplência |
| Margem opaca | Projetos com prejuízo só descobertos tarde |

---

## Oportunidades

- Margem por job na aprovação do orçamento (CFO valida).
- Sequência automática de cobrança (D-7, D+1, D+15, D+30).
- Limites de crédito por cliente baseados em histórico.
- Projeção de caixa com pipeline comercial integrado.
- ROI calculado antes de qualquer investimento >€5.000.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Faturação automática | Job concluído + QC OK | Gera fatura no PHC |
| Sequência de cobrança | Vencimento | Emails + alerta financeiro |
| Alerta margem negativa | Orçamento criado | CFO bloqueia ou escala |
| Projeção de caixa | Semanal | CFO gera forecast 90 dias |
| Alerta inadimplência | Fatura >30 dias | Watcher notifica Ana + vendedor |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Margem bruta | 42% | 46% |
| EBITDA | 12% | 16% |
| DSO | 47 dias | 32 dias |
| Inadimplência | 9% | 4% |
| Faturação no dia da entrega | 40% | 90% |
| Margem por projeto visível | 0% | 100% |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Gestão financeira | Ana Gil |
| Contabilidade | Contabilista externo |
| Aprovação de investimentos | Ricardo Gil (CEO) |
| Curadoria no Twin | CFO + CBO |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| PHC | Faturação, compras, stocks, DSO |
| Banco online | Movimentos, reconciliação |
| Contabilidade | Balancete, IVA, impostos |
| Pipeline comercial | Receita prevista |
| Executive Watchers | Alertas financeiros |
