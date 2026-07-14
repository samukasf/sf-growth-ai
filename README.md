# SF Growth AI

Workspace executivo em Next.js 16 com Samuel Runtime, contexto empresarial, memória, módulos especializados e conversa contínua com streaming pela Responses API.

## Arranque local

Requisitos: Node.js 20+ e npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

A aplicação fica disponível em [http://localhost:3000/samuel-ai](http://localhost:3000/samuel-ai).

## Configuração

Preencha em `.env.local`:

- `OPENAI_API_KEY` para conversas geradas por IA. `OPENAI_MODEL` é configurável (`gpt-5.4-mini` por padrão para equilibrar latência e custo).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` para dados e histórico persistente.
- `AI_GATEWAY_API_KEY`, `AI_GATEWAY_BASE_URL` e `AI_GATEWAY_MODEL` apenas quando utilizar um gateway compatível com a Responses API. Estes valores têm precedência sobre os equivalentes OpenAI.

Sem uma chave de IA, o chat informa claramente a limitação e continua funcional para análises empresariais com a resposta determinística do Samuel Runtime. Sem a configuração administrativa do Supabase, o histórico fica isolado no navegador. Nenhuma destas degradações impede o build.

## Base de dados

As migrations estão em `supabase/migrations`. As migrations `20260714110000_samuel_conversations.sql` e `20260714112000_executive_inbox_actions.sql` criam o histórico do chat e a persistência da Executive Inbox, com índices e RLS.

Num projeto Supabase ligado:

```bash
npx supabase db push
```

A `SUPABASE_SERVICE_ROLE_KEY` é usada apenas no servidor para associar a sessão HTTP ao histórico do chat e nunca deve receber o prefixo `NEXT_PUBLIC_`.

## Samuel Runtime

O endpoint `POST /api/samuel-ai/chat`:

1. valida a mensagem e limita o histórico por quantidade e tamanho;
2. carrega memória, contexto, Company Brain e conselho disponível;
3. executa as sete etapas do pipeline real;
4. envia o histórico como mensagens estruturadas e transmite deltas de texto progressivos;
5. persiste utilizador, resposta, provedor, modelo e resumo do runtime.

O prompt do Samuel AI mantém a continuidade da conversa, responde no idioma do utilizador e usa o contexto empresarial somente quando for relevante. O cliente suporta restauro de histórico, fallback local, cancelamento, erro e retry.

## Qualidade

```bash
npm test
npm run lint
npm run build
```

Os testes cobrem o pipeline, a ponte do Workspace para o Runtime, o protocolo NDJSON e o streaming da Responses API.
