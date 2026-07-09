# Modals — SF Growth AI

---

## Componente: `DsModal`

Import: `@/components/design-system`

---

## Anatomia

```
        ┌─────────────────────────┐
        │ Title                   │
        │ Description             │
        ├─────────────────────────┤
        │ Content (optional)      │
        ├─────────────────────────┤
        │        [Cancel] [Confirm]│
        └─────────────────────────┘
```

---

## Especificação

| Elemento | Valor |
|----------|-------|
| Overlay | `rgba(15,23,42,0.45)` + blur 4px |
| Panel max-width | 512px |
| Panel bg | `--ds-surface` |
| Panel radius | `--ds-radius-xl` (16px) |
| Panel shadow | `--ds-shadow-lg` |
| z-index | 50 |
| Padding header/body/footer | 24px |

---

## Botões

- Cancelar: `secondary` (esquerda)
- Confirmar: `primary` ou `danger` (direita)

---

## Acessibilidade

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` no título
- Focus trap dentro do modal
- Escape fecha (roadmap)

---

## Regras

- ✅ Confirmação para ações destrutivas
- ✅ Título claro ("Excluir cliente?")
- ❌ Modais sobre modais
- ❌ Modais sem forma de fechar
- ❌ Conteúdo scrollável > 70vh sem max-height

---

## CSS patterns

Classes: `.ds-modal-overlay`, `.ds-modal-panel`  
File: `styles/design-system/patterns.css`

---

## Implementação

`components/design-system/Modal.tsx`
