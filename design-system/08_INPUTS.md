# Inputs — SF Growth AI

---

## Componentes

| Componente | Uso |
|------------|-----|
| `DsInput` | Texto, email, tel, url, number |
| `DsTextarea` | Texto multilinha |
| `DsSelect` | Seleção de opções |

Import: `@/components/design-system`

---

## Anatomia

```
Label *          ← .ds-label, 14px medium
┌────────────────┐
│ placeholder    │  ← height 40px, radius 8px
└────────────────┘
Hint text        ← 12px muted (opcional)
Error message    ← 12px danger (quando inválido)
```

---

## Especificação

| Propriedade | Valor |
|-------------|-------|
| Height | 40px (input/select), auto (textarea min 96px) |
| Padding | 12px horizontal |
| Border | 1px `--ds-border` |
| Radius | `--ds-radius-md` (8px) |
| Font | 14px Inter |
| Background | `--ds-surface` |

---

## Estados

| Estado | Visual |
|--------|--------|
| Default | Border `#E2E8F0` |
| Hover | Border `#CBD5E1` |
| Focus | Border primary + ring primary/15 |
| Error | Border danger + ring danger/15 |
| Disabled | Opacity 50% |

---

## Label

- Sempre acima do campo
- Obrigatório marcado com `*`
- Opcional: "(opcional)" em muted

---

## Textarea

- Min height: 96px (6rem)
- Rows default: 4
- Full width em grid (`sm:col-span-2`)

---

## Select

- Mesma altura e estilo do Input
- Chevron nativo do browser estilizado via CSS

---

## Regras

- ✅ Validação inline abaixo do campo
- ✅ Placeholder descritivo, não como label
- ✅ Agrupar campos relacionados em grid 2 col
- ❌ Labels inside fields (floating labels)
- ❌ Inputs sem label acessível

---

## Implementação

- `components/design-system/Input.tsx`
- `components/design-system/Textarea.tsx`
- `components/design-system/Select.tsx`
