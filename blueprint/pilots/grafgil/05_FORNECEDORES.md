# Grafgil Digital Twin — Fornecedores

> **Camada:** Business Twin™ — Cadeia de abastecimento  
> **Documento:** `blueprint/pilots/grafgil/05_FORNECEDORES.md`

---

## Estado Atual

| Fornecedor | Categoria | % Compras | Prazo | Avaliação |
|---|---|---|---|---|
| VinilPorto Lda. | Vinis e lonas | 28% | 30d | Não avaliado |
| Iberopaper | Papéis e cartões | 18% | 45d | Não avaliado |
| LED Sign Supply | Iluminação/LED | 12% | 30d | Não avaliado |
| MetalFrame PT | Estruturas metálicas | 10% | 60d | Não avaliado |
| Química Print | Tintas/consumíveis | 8% | 30d | Não avaliado |
| Outros (29) | Diversos | 24% | Variável | Não avaliado |

**Volume anual:** ~€980.000 · Top 3 = 58% das compras · 12% entregas com atraso >2 dias.

---

## Objetivos

1. Modelar fornecedores com scorecard (qualidade, prazo, preço, serviço).
2. Reduzir dependência dos top 3 com alternativas pré-qualificadas.
3. Eliminar compras de urgência (8% com +22% sobretaxa).
4. Calibrar stock de segurança com consumo real.
5. Negociar volume consolidado com top 5.

---

## Problemas

- Concentração de risco nos top 3 fornecedores.
- Preços renegociados informalmente sem benchmarking.
- 12% entregas atrasadas impactam produção.
- 8% compras de urgência com sobretaxa média de 22%.
- Stock: excesso (€45k parado) ou ruptura (6×/mês).

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Pedido manual de reposição | Rupturas descobertas tarde |
| Sem fornecedor backup | Paragem se VinilPorto falha |
| Negociação ad-hoc | Sem poder de barganha por volume |

---

## Oportunidades

- Scorecard trimestral com dados do Twin.
- Leilão reverso para compras >€2.000.
- Compras programadas eliminam urgências.
- Consolidação de volume: poupança estimada 5% (€49k/ano).
- Catálogo de preços no Executive Knowledge.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Reposição automática | Stock < mínimo | Gera pedido; aprovação se >€1.000 |
| Alerta entrega atrasada | SLA fornecedor excedido | COO notifica + avalia alternativa |
| Comparação de preços | Compra >€2.000 | Solicita 3 cotações |
| Scorecard automático | Fim do trimestre | Calcula nota por fornecedor |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Entregas atrasadas | 12% | 4% |
| Compras de urgência | 8% | 2% |
| Poupança em compras | 0% | 5% |
| Rupturas de stock/mês | 6 | 1 |
| Capital parado em stock | €45k | €28k |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Compras operacionais | Paulo Ferreira |
| Aprovação financeira | Ana Gil |
| Negociação estratégica | Ricardo Gil |
| Curadoria no Twin | COO + Executive Knowledge |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| PHC | Histórico de compras, preços, prazos |
| Executive Watchers | Alertas de stock e entrega |
| Inteligência de Mercado | Benchmark de preços de materiais |
| Email | Cotações e confirmações de pedido |
