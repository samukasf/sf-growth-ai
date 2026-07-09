# Cards — SF Growth AI

---

## Componentes

| Componente | Uso |
|------------|-----|
| `DsCard` | Container genérico |
| `DsStatCard` | KPI simples (label + valor) |
| `DsMetricCard` | Métrica com delta/trend |
| `DsActionCard` | CTA com contexto |

---

## DsCard (base)

| Propriedade | Valor |
|-------------|-------|
| Background | `--ds-surface` |
| Border | 1px `--ds-border` |
| Radius | `--ds-radius-xl` (16px) |
| Shadow | `--ds-shadow-sm` |
| Padding sm/md/lg | 16 / 20 / 24px |

---

## DsStatCard

```
┌─────────────────────┐
│ CLIENTES            │  ← caption uppercase
│ 0                   │  ← 30px semibold
│ hint opcional       │  ← 12px muted
└─────────────────────┘
```

Uso: resumo Executive Home, dashboards.

---

## DsMetricCard

```
┌─────────────────────┐
│ Receita      +12%   │  ← label + delta colorido
│ € 45.200            │  ← 24px semibold
└─────────────────────┘
```

Trend colors: success (up), danger (down), muted (neutral).

---

## DsActionCard

```
┌─────────────────────┐
│ Próximo passo       │  ← heading
│ Descrição...        │  ← body-sm muted
│ [ Botão ]           │  ← DsButton
└─────────────────────┘
```

Uso: onboarding, CTAs contextuais.

---

## Regras

- ✅ Um propósito por card
- ✅ Header com title + subtitle opcional
- ✅ Ações no header (right) ou footer
- ❌ Cards dentro de cards (max 1 nível)
- ❌ Sombras pesadas

---

## Grid de cards

Stat cards: `.ds-grid-4` com gap 24px.

---

## Implementação

`components/design-system/Card.tsx`, `StatCard.tsx`, `MetricCard.tsx`, `ActionCard.tsx`
