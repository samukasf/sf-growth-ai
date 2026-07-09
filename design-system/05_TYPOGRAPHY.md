# Typography — SF Growth AI

---

## Fonte oficial: Inter

```css
--ds-font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

- Pesos: 400, 500, 600, 700
- Carregamento: Google Fonts ou `next/font/google`
- Fallback: system-ui, sans-serif

---

## Hierarquia

| Nível | Classe | Size | Weight | Line-height | Uso |
|-------|--------|------|--------|-------------|-----|
| Display | `.ds-display` | 30px | 600 | 1.25 | Hero |
| Title | `.ds-title` | 24px | 600 | 1.25 | Página |
| Heading | `.ds-heading` | 18px | 600 | 1.25 | Seção |
| Body | `.ds-body` | 16px | 400 | 1.5 | Texto |
| Body SM | `.ds-body-sm` | 14px | 400 | 1.5 | Secundário |
| Caption | `.ds-caption` | 12px | 500 | 1.5 | Metadados |
| Label | `.ds-label` | 14px | 500 | 1.5 | Form labels |

---

## Letter spacing

| Contexto | Valor |
|----------|-------|
| Display / Title | -0.02em |
| Caption uppercase | +0.02em |
| Body | 0 |

---

## Mono (código)

```css
--ds-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

Uso: IDs, tokens, código. Nunca em copy de marca.

---

## Responsividade

| Breakpoint | Ajuste |
|------------|--------|
| Mobile | Display → Title, Title → Heading |
| Desktop | Hierarquia completa |

---

## Regras

- ✅ Máximo 2 pesos por bloco de texto
- ✅ Labels sempre acima do campo
- ❌ ALL CAPS em parágrafos
- ❌ Texto < 12px (exceto legal)
- ❌ Serifas

---

## Implementação

CSS: `styles/design-system/typography.css`
