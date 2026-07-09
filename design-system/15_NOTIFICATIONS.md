# Notifications — SF Growth AI

---

## Componente: `DsNotification`

Import: `@/components/design-system`

---

## Variantes

| Variant | Border/BG | Uso |
|---------|-----------|-----|
| `default` | Surface + border | Informação |
| `success` | Success soft | Confirmação |
| `warning` | Warning soft | Alerta |
| `danger` | Danger soft | Erro |

---

## Anatomia

```
┌─────────────────────────────────┐
│ Title                           │
│ Message (optional)              │
└─────────────────────────────────┘
```

---

## Especificação

| Propriedade | Valor |
|-------------|-------|
| Padding | 16px |
| Radius | `--ds-radius-lg` (12px) |
| Shadow | `--ds-shadow-sm` |
| Title | 14px medium |
| Message | 14px muted |
| z-index (toast) | 60 |

---

## Posicionamento

| Tipo | Posição |
|------|---------|
| Inline | Dentro do content flow |
| Toast (roadmap) | Top-right, stack vertical |

---

## Duração (toast roadmap)

| Variant | Auto-dismiss |
|---------|--------------|
| Success | 4s |
| Default | 5s |
| Warning | 6s |
| Danger | Manual dismiss |

---

## Regras

- ✅ Mensagem clara e acionável
- ✅ Success após save/update
- ❌ Notifications empilhadas > 3
- ❌ Exclamações ou emojis

---

## CSS patterns

Classes: `.ds-notification`, `.ds-notification-success`, etc.  
File: `styles/design-system/patterns.css`

---

## Implementação

`components/design-system/Notification.tsx`
