# Spec — Company Brain

## Objetivo

Especificar o módulo **Company Brain**: memória factual da empresa, indexação de contexto e enriquecimento de solicitações ao Orchestrator. Evita alucinação — apresenta fatos, não opiniões.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Em desenvolvimento |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Engenharia |

## Escopo

- Perfil e dados operacionais da empresa
- Build e atualização de contexto corporativo
- Integração com Executive Knowledge e Memory
- API de build e página de debug

## Componentes

| Componente | Localização |
|------------|-------------|
| API Build | `app/api/company-brain/build/` |
| Debug UI | `app/debug/company-brain/` |
| Domínio | `core/company-discovery/`, presenters em `apps/web/src/core/company-brain/` |
| Business Twin | `docs/04-ai/BUSINESS_TWIN.md` |

## Fluxo

```
Fontes de dados → Company Brain (indexação) → Contexto enriquecido → Orchestrator → Resposta fundamentada
```

## Critérios de aceite

- [ ] Build executável via API com resposta estruturada
- [ ] Debug page exibe estado do brain para desenvolvimento
- [ ] Fatos distinguíveis de recomendações na UI

## Próximos passos

- [ ] Documentar contrato da API `/api/company-brain/build`
- [ ] Definir schema de Company Profile
- [ ] Alinhar com `blueprint/06_COMPANY_BRAIN.md`

## Referências

- `blueprint/06_COMPANY_BRAIN.md`
- `docs/04-ai/BUSINESS_TWIN.md`
- `docs/04-ai/BUSINESS_DNA.md`
