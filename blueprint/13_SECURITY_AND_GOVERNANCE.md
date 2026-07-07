# Security and Governance

## Objetivo

Estabelecer os pilares de segurança, governança, compliance e auditoria do SF Growth AI.

## Responsabilidades

- Proteger dados organizacionais e de usuários
- Garantir conformidade regulatória (GDPR, etc.)
- Auditar todas as ações do sistema
- Controlar acesso por papel, departamento e política
- Governar uso de IA e decisões automatizadas

## Componentes

- **AccessPolicyEngine** — Políticas de acesso por escopo
- **AuditService** — Trilha completa (quem, quando, o quê, módulo, resultado)
- **Approval Workflows** — Limites por cargo (Manager €2k, Director €20k, Partner ilimitado)
- **Data Encryption** — Em trânsito e em repouso
- **Tenant Isolation** — Multi-tenant ready
- **AI Governance** — Rastreabilidade de decisões de IA

## Fluxo

```
Ação solicitada
      ↓
Autenticação + IdentityResolver
      ↓
AccessPolicyEngine (autorizado?)
      ↓
Execução
      ↓
AuditService (registro)
      ↓
Evento de domínio
```

## Integrações

- [05_ORGANIZATION_BRAIN.md](./05_ORGANIZATION_BRAIN.md)
- [14_AI_PROVIDERS.md](./14_AI_PROVIDERS.md)
- `core/organization/` — AuditEntry, AccessPolicy

## Futuro

SOC2, ISO 27001, DPA automatizado, SOC dashboard e políticas de retenção por jurisdição.
