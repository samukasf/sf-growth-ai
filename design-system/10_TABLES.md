# Tables — SF Growth AI

---

## Componente: `DsTable`

Import: `@/components/design-system`

---

## Anatomia

```
┌──────────────────────────────────────────┐
│ HEADER 1    │ HEADER 2    │ HEADER 3    │  ← bg surface-muted
├─────────────┼─────────────┼─────────────┤
│ Cell        │ Cell        │ Cell        │  ← hover row
│ Cell        │ Cell        │ Cell        │
└──────────────────────────────────────────┘
```

---

## Especificação

| Elemento | Estilo |
|----------|--------|
| Container | Card wrapper, overflow-x auto |
| Header | 12px uppercase, semibold, muted |
| Header bg | `--ds-surface-muted` |
| Cell padding | 16px horizontal, 12px vertical |
| Row border | 1px `--ds-border` bottom |
| Row hover | `--ds-surface-muted` 60% opacity |
| Font | 14px body |

---

## Header

- Texto uppercase, tracking wide
- Nunca interativo no MVP (sort via controls externos)

---

## Empty state

Quando `rows.length === 0`:

| Propriedade | Valor |
|-------------|-------|
| Message | "Sem dados." (customizável) |
| Padding | 32px vertical |
| Align | center |

---

## Responsividade

- `min-width: 512px` na tabela
- Container com `overflow-x: auto` em mobile
- Alternativa mobile: converter para card list (roadmap)

---

## Regras

- ✅ Máximo 6 colunas visíveis sem scroll
- ✅ Badges para status em células
- ✅ Empty state sempre presente
- ❌ Tabelas sem header
- ❌ Zebra striping (usar hover)

---

## Implementação

`components/design-system/Table.tsx`
