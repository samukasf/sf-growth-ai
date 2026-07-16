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

- `OPENAI_API_KEY` para conversas geradas por IA e para a voz Realtime. `OPENAI_MODEL` é configurável (`gpt-5.4-mini` por padrão).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` para dados e histórico persistente.
- `AI_GATEWAY_API_KEY`, `AI_GATEWAY_BASE_URL` e `AI_GATEWAY_MODEL` somente para o chat textual. O gateway pode manter uma IA aberta como provedora principal do texto, mas nunca controla a voz Realtime.
- `OPENAI_REALTIME_MODEL` exclusivamente para a voz; a identidade vocal do Samuel usa `cedar`.

Sem uma chave de IA, o chat informa claramente a limitação e continua funcional para análises empresariais com a resposta determinística do Samuel Runtime. Sem a configuração administrativa do Supabase, o histórico fica isolado no navegador. Nenhuma destas degradações impede o build.

## CI/CD

Este repositório inclui GitHub Actions em `.github/workflows/ci.yml` para executar `npm test`, `npm run lint` e `npm run build` em pushes e pull requests. Configure as variáveis acima como secrets/variables do ambiente de deploy; nunca grave chaves reais no repositório.

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

## Voz Realtime do Samuel AI

A conversa por voz usa WebRTC no navegador e a OpenAI Realtime API pelo endpoint server-side `POST /api/samuel-ai/realtime/offer`. O navegador envia apenas a oferta SDP; a chave permanece no servidor.

A voz utiliza o esquema GA da Realtime API:

- `audio.input.transcription` usa `gpt-4o-mini-transcribe`;
- `audio.input.turn_detection` usa detecção automática de fala (`server_vad`);
- `audio.output.voice` usa a identidade masculina fixa `cedar`;
- `OPENAI_REALTIME_MODEL` aceita somente modelos Realtime e usa `gpt-realtime-2.1` como padrão.

O usuário inicia a conversa e fala naturalmente. A detecção automática encerra cada turno, cria a resposta e permite interromper o Samuel. A sessão termina automaticamente após oito minutos. Se WebRTC, microfone ou a Realtime API estiverem indisponíveis, o chat textual e o ditado do navegador continuam disponíveis.

`AI_GATEWAY_*` é exclusivo do chat textual. Nenhuma configuração do gateway ou de modelo aberto é reutilizada na rota de voz.

## Qualidade

```bash
npm test
npm run lint
npm run build
```

Os testes cobrem o pipeline, a ponte do Workspace para o Runtime, o protocolo NDJSON, o streaming da Responses API e a configuração server-side da voz Realtime.
