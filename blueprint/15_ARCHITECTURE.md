# Architecture

## Objetivo

Documentar a arquitetura técnica oficial do SF Growth AI — camadas, módulos, convenções e fluxo de dados.

## Responsabilidades

- Definir estrutura de pastas e módulos
- Estabelecer padrões de Clean Architecture
- Garantir isolamento entre camadas
- Orientar novas sprints e contribuições

## Componentes

### Camadas por módulo (`core/*/`)
```
domain/          → Entidades, eventos, ports
application/     → Use cases, services, DTOs
infrastructure/  → Repositórios, adapters, factories
shared/          → Types, errors, event dispatcher
```

### Módulos principais
- `core/organization/`
- `core/executive-knowledge|learning|wisdom|experience|innovation|projects/`
- `core/executive-orchestrator/`
- `features/samuel-ai/` — Executive Workspace (UI)

### Princípios
- DDD + Event Driven + SOLID
- UI → Orchestrator ONLY (engines nunca direto)
- Dependency Inversion via ports
- Multi-tenant ready

## Fluxo

```
Browser (SSR)
      ↓
features/samuel-ai (UI)
      ↓
core/executive-orchestrator
      ↓
core/executive-engines + core/organization
      ↓
Infrastructure (in-memory → DB futuro)
```

## Integrações

- [08_EXECUTIVE_ENGINES.md](./08_EXECUTIVE_ENGINES.md)
- [02_PRINCIPIOS.md](./02_PRINCIPIOS.md)
- `ARCHITECTURE.md` (raiz)
- `docs/03-architecture/`

## Futuro

PostgreSQL, Redis, event bus distribuído (Kafka/RabbitMQ), API Gateway e microsserviços por engine em escala.
