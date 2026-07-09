# Typography — SF Growth AI

---

## Fonte oficial

**Inter**

- Open source, otimizada para interfaces
- Alta legibilidade em tamanhos pequenos
- Personalidade neutra, profissional e moderna
- Alinhada com referências: Linear, Stripe, Notion, Vercel

---

## Hierarquia tipográfica

| Nível | Classe DS | Tamanho | Peso | Uso |
|-------|-----------|---------|------|-----|
| Display | `.ds-display` | 30px / 1.875rem | 600 | Hero, landing, primeira impressão |
| Title | `.ds-title` | 24px / 1.5rem | 600 | Títulos de página |
| Heading | `.ds-heading` | 18px / 1.125rem | 600 | Títulos de seção, cards |
| Body | `.ds-body` | 16px / 1rem | 400 | Texto principal |
| Body SM | `.ds-body-sm` | 14px / 0.875rem | 400 | Texto secundário, descrições |
| Caption | `.ds-caption` | 12px / 0.75rem | 500 | Labels, metadados, uppercase |
| Label | `.ds-label` | 14px / 0.875rem | 500 | Labels de formulário |

---

## Line height

| Contexto | Valor |
|----------|-------|
| Títulos | 1.25 (tight) |
| Corpo | 1.5 (normal) |
| Textos longos | 1.625 (relaxed) |

---

## Letter spacing

| Contexto | Valor |
|----------|-------|
| Display / Title | -0.02em a -0.015em |
| Caption uppercase | +0.02em |
| Corpo | 0 (default) |

---

## Pesos permitidos

| Peso | Uso |
|------|-----|
| 400 Regular | Corpo, parágrafos |
| 500 Medium | Labels, badges, nav items |
| 600 Semibold | Títulos, ênfase |
| 700 Bold | Apenas Display em contextos especiais |

> Evitar 300 (Light) — reduz legibilidade e autoridade percebida.

---

## Tipografia na marca

### Wordmark

```
SF Growth AI
```

- Fonte: Inter Semibold (600)
- Tracking: -0.02em

### Slogan

```
Toda empresa precisa de um Supercérebro.
```

- Fonte: Inter Regular (400) ou Medium (500)
- Tamanho: Body ou Body SM conforme contexto
- Nunca em ALL CAPS

### Nome do produto Samuel

```
Samuel
```

- Inter Semibold
- Pode aparecer como **Samuel AI™** em materiais formais

---

## Combinações proibidas

- ❌ Mais de 2 famílias tipográficas na mesma tela
- ❌ Serifas (exceto citações editoriais futuras)
- ❌ ALL CAPS em parágrafos ou slogans
- ❌ Texto abaixo de 12px (exceto metadados legais)
- ❌ Itálico para ênfase em UI (usar peso ou cor)

---

## Tipografia mono

Reservada para: IDs, código, tokens técnicos.

Nunca usar mono para texto de marca ou marketing.

---

## Responsividade

| Breakpoint | Ajuste |
|------------|--------|
| Mobile | Display → Title, Title → Heading |
| Tablet | Manter hierarquia, reduzir padding |
| Desktop | Hierarquia completa |

---

## Implementação

Classes em `styles/design-system/typography.css`  
Componentes em `components/design-system/`
