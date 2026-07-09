# Badges — SF Growth AI

---

## Componente: `DsBadge`

Import: `@/components/design-system`

---

## Variantes

| Variant | Background | Text | Uso |
|---------|------------|------|-----|
| `default` | `--ds-surface-muted` | `--ds-text-muted` | Neutro |
| `primary` | `--ds-primary-soft` | `--ds-primary` | Destaque |
| `success` | `--ds-success-soft` | `--ds-success` | Saudável, ativo |
| `warning` | `--ds-warning-soft` | `--ds-warning` | Onboarding, atenção |
| `danger` | `--ds-danger-soft` | `--ds-danger` | Risco, erro |

---

## Especificação

| Propriedade | Valor |
|-------------|-------|
| Font | 12px medium |
| Padding | 4px 10px |
| Radius | `--ds-radius-full` (pill) |
| Display | inline-flex |

---

## Uso em contexto

| Status cliente | Badge |
|----------------|-------|
| Saudável | `success` |
| Novo Cliente | `primary` |
| Em Onboarding | `warning` |

---

## Regras

- ✅ Texto curto (1–2 palavras)
- ✅ Um badge por status
- ❌ Badges como botões clicáveis (usar button)
- ❌ ALL CAPS

---

## Implementação

`components/design-system/Badge.tsx`
