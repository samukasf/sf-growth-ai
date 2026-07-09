# Topbar — SF Growth AI

---

## Componente: `DsTopNavigation`

Import: `@/components/design-system`

---

## Anatomia

```
┌──────────────────────────────────────────────────────┐
│ [Brand] Title / Subtitle          [Actions] [Avatar] │
└──────────────────────────────────────────────────────┘
```

---

## Especificação

| Propriedade | Valor |
|-------------|-------|
| Height | 64px (`--ds-topbar-height`) |
| Background | `--ds-surface` |
| Border bottom | 1px `--ds-border` |
| Padding horizontal | 24px |
| z-index | 30 (sticky) |

---

## Slots

| Slot | Conteúdo |
|------|----------|
| `brand` | Logo SF (símbolo 40px) |
| `title` | Nome da empresa / seção |
| `subtitle` | Contexto (ex.: "Executive Home") |
| `actions` | Botões, badges, saudação |

---

## Padrão Executive Home

```
[SF] SF Growth AI          Bom dia
     Influence Publicidade
```

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile | Subtitle oculto, hamburger visível |
| Desktop | Layout completo |

---

## Regras

- ✅ Sticky no topo durante scroll
- ✅ Backdrop blur opcional em dark theme
- ✅ Saudação dinâmica à direita
- ❌ Mais de 2 ações no topbar
- ❌ Títulos longos sem truncate

---

## Implementação

`components/design-system/TopNavigation.tsx`
