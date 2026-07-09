# Buttons — SF Growth AI

---

## Componente: `DsButton`

Import: `@/components/design-system`

---

## Variantes

| Variante | Uso | Visual |
|----------|-----|--------|
| `primary` | Ação principal da tela | Fundo `#2563EB`, texto branco |
| `secondary` | Ação secundária, cancelar | Borda + fundo branco |
| `ghost` | Ações terciárias, nav inline | Sem borda, hover muted |
| `danger` | Excluir, ações destrutivas | Fundo `#DC2626`, texto branco |

---

## Tamanhos

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | 12px horizontal | 12px |
| `md` | 40px | 16px horizontal | 14px |
| `lg` | 44px | 20px horizontal | 14px |

Default: **md**

---

## Estados

| Estado | Comportamento |
|--------|---------------|
| Default | Cor base |
| Hover | Primary hover / border strong |
| Focus | Ring 2px primary/30 + offset |
| Disabled | Opacity 50%, pointer-events none |
| Loading | Spinner + label, disabled |

---

## Regras

- ✅ **Um** botão primary por tela/seção
- ✅ Primary à direita em grupos (Cancelar | Salvar)
- ✅ Label claro: verbo + objeto ("Salvar Cliente")
- ❌ Múltiplos primary na mesma view
- ❌ Botões com texto ALL CAPS
- ❌ Largura > 320px sem necessidade

---

## Com ícone (Lucide)

```tsx
<DsButton>
  <Plus size={16} />
  Novo Cliente
</DsButton>
```

Gap entre ícone e texto: **8px**

---

## Border radius

`--ds-radius-md` (8px)

---

## Implementação

`components/design-system/Button.tsx`
