# Sidebar — SF Growth AI

---

## Componente: `DsSidebar`

Import: `@/components/design-system`

---

## Anatomia

```
┌──────────────────┐
│ Title            │  ← header opcional
│ Subtitle         │
├──────────────────┤
│ ● Home           │  ← item ativo
│   Clientes       │
│   Projetos       │
│   ...            │
├──────────────────┤
│ Footer           │  ← opcional
└──────────────────┘
```

---

## Especificação

| Propriedade | Valor |
|-------------|-------|
| Width | 256px (`--ds-sidebar-width`) |
| Background | `--ds-surface` |
| Border right | 1px `--ds-border` |
| Item padding | 12px |
| Item radius | 8px |
| Item font | 14px |

---

## Item ativo

- Background: `--ds-primary-soft`
- Text: `--ds-primary`
- Weight: 500

---

## Item inativo

- Text: `--ds-text-muted`
- Hover: `--ds-surface-muted` bg

---

## Item placeholder (disabled)

- Opacity: 40%
- Cursor: default
- Title: "Em breve"

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| ≥ 1024px | Fixa, visível |
| < 1024px | Oculta, hamburger overlay |

---

## Ícones (Lucide)

Nav items com ícone 20px + label. Gap 8px.

---

## Regras

- ✅ Máximo 8 itens principais
- ✅ Agrupar secundários em footer
- ✅ Item ativo sempre visível
- ❌ Submenus aninhados > 2 níveis (MVP)

---

## Implementação

`components/design-system/Sidebar.tsx`
