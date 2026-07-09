# Icons — SF Growth AI

---

## Biblioteca oficial: Lucide Icons

**Lucide** é a biblioteca de ícones padrão do SF Growth AI.

- Estilo: line/outline
- Stroke: 1.5–2px
- Open source, consistente, tree-shakeable
- Pacote: `lucide-react` (quando instalado)

---

## Tamanhos

| Contexto | Size | Token |
|----------|------|-------|
| Inline (botão, badge) | 16px | `--ds-icon-sm` |
| Navegação | 20px | `--ds-icon-md` |
| Empty state / destaque | 24px | `--ds-icon-lg` |
| Hero / ilustração | 32px | `--ds-icon-xl` |

---

## Cor

| Contexto | Cor |
|----------|-----|
| Padrão | `--ds-text-muted` |
| Ativo / nav selecionado | `--ds-primary` |
| Sobre primary button | `--ds-text-inverse` |
| Semântico success | `--ds-success` |
| Semântico danger | `--ds-danger` |

---

## Ícones recomendados por contexto

| Contexto | Lucide icon |
|----------|-------------|
| Novo Cliente | `Plus` |
| Pesquisa | `Search` |
| Voltar | `ArrowLeft` |
| Editar | `Pencil` |
| Excluir | `Trash2` |
| Configurações | `Settings` |
| Home | `Home` |
| Clientes | `Users` |
| Projetos | `FolderKanban` |
| Agenda | `Calendar` |
| Samuel | `Brain` ou `Sparkles` |
| Sucesso | `CheckCircle2` |
| Alerta | `AlertTriangle` |
| Erro | `XCircle` |
| Loading | `Loader2` (com spin) |
| Empty | `Inbox` |

---

## Regras

- ✅ Um ícone por ação (não duplicar com emoji)
- ✅ Sempre com `aria-hidden="true"` quando decorativo
- ✅ Botões icon-only precisam de `aria-label`
- ❌ Emojis como ícones de UI
- ❌ Ícones filled/solid de outras bibliotecas
- ❌ Mix de bibliotecas (Heroicons + Lucide)

---

## Uso (futuro)

```tsx
import { Plus } from "lucide-react";

<Plus size={16} strokeWidth={2} className="text-[var(--ds-text-muted)]" />
```

> Instalação de `lucide-react` prevista na fase de Component Library Execution.
