# Setup operacional — SF Growth AI

Checklist do que **só você** precisa fazer para o produto ficar 100% ligado com dados reais. O código já está preparado; faltam contas, chaves e deploy.

---

## 1. Base (obrigatório)

1. Crie/abra um projeto no [Supabase](https://supabase.com).
2. Copie `.env.example` → `.env.local`.
3. Preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Aplique as migrations:

```bash
npx supabase link --project-ref <seu-project-ref>
npx supabase db push
```

5. Instale e suba local:

```bash
npm ci
npm run dev
```

6. Abra [http://localhost:3000/onboarding](http://localhost:3000/onboarding) e crie a primeira empresa  
   **ou** use Home → Nova Empresa (cria também o registo operacional em `companies`).

7. Confirme o Samuel em `/samuel-ai?companyId=<uuid>`.

---

## 2. Inteligência Samuel (chat + voz)

1. Crie uma chave em [OpenAI Platform](https://platform.openai.com).
2. Em `.env.local`:
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-5.4-mini` (ou outro)
   - `OPENAI_REALTIME_MODEL=gpt-realtime-2.1` (voz)
3. (Opcional) Gateway textual: `AI_GATEWAY_API_KEY`, `AI_GATEWAY_BASE_URL`, `AI_GATEWAY_MODEL`.
4. Reinicie `npm run dev` e teste o chat em `/samuel-ai`.

---

## 3. Google Workspace (Gmail / Agenda / Drive / Contatos)

1. No Google Cloud Console, crie um OAuth Client (Web).
2. Adicione redirect URI:  
   `http://localhost:3000/api/integrations/google/oauth/callback`  
   (e o equivalente de produção).
3. Em `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/google/oauth/callback`
4. Abra `/integrations/google/connect?companyId=<uuid>` e clique **Conectar Google**.
5. No Samuel, o painel Google Workspace deve mostrar contas ligadas.
6. **Importante:** se a conta já estava ligada antes do scope `gmail.modify`, clique **Reconectar Google** para o Samuel poder arquivar, apagar e organizar e-mails.
7. No chat do Samuel, peça por exemplo:
   - “Mostra meus e-mails”
   - “Envia e-mail para nome@empresa.com assunto: Olá”
   - “Apaga o email id:XXXX”
   - Ações de escrita/apagar pedem **confirmação** no cartão antes de executar.

---

## 4. Google Analytics / Business / Search Console

Estes usam **tokens estáticos** (não o OAuth Workspace):

1. Obtenha access tokens com os scopes certos (ou service account / OAuth offline).
2. Preencha em `.env.local`:

| Integração | Variáveis |
|------------|-----------|
| GA4 | `GOOGLE_ANALYTICS_ACCESS_TOKEN`, `GOOGLE_ANALYTICS_PROPERTY_ID` (+ opcional `GOOGLE_ANALYTICS_PROPERTY_MAP`) |
| Business | `GOOGLE_BUSINESS_ACCESS_TOKEN`, `GOOGLE_BUSINESS_LOCATION_NAME` (+ opcional map) |
| Search Console | `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN`, `GOOGLE_SEARCH_CONSOLE_SITE_URL` (+ opcional map) |

3. Reinicie o servidor e abra as secções correspondentes no workspace.

---

## 5. Meta (Facebook / Instagram / Ads)

### Opção A — OAuth (recomendado)

1. Crie um App em [Meta for Developers](https://developers.facebook.com).
2. Ative as permissões de Pages / Instagram / Ads.
3. Em `.env.local`:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/meta/oauth/callback`
4. Abra `/integrations/meta/connect` e conecte a página.
5. (Opcional) `META_PAGE_ID` para forçar uma página específica quando a conta tem várias.

### Opção B — Token manual

1. Gere um Page Access Token de longa duração.
2. Defina `META_ACCESS_TOKEN` + `META_PAGE_ID` (e maps/IG/ads se quiser).

---

## 6. LinkedIn

1. Crie um app LinkedIn com acesso à Company Page (Community Management / Marketing API).
2. Gere um access token com permissões de estatísticas da organização.
3. Em `.env.local`:
   - `LINKEDIN_ACCESS_TOKEN`
   - `LINKEDIN_ORG_ID`  
   ou `LINKEDIN_ORG_MAP={"<companyUuid>":"<orgId>"}`
4. Veja o guia em `/integrations/linkedin/connect`.
5. Reinicie e abra a secção LinkedIn no Samuel.

---

## 7. Market Watcher (notícias)

1. Crie uma chave em [NewsAPI](https://newsapi.org).
2. Defina `NEWS_API_KEY` (ou `MARKET_NEWS_API_KEY`).
3. Sem NewsAPI, o Market Watcher ainda funciona se existirem **memórias** de mercado/concorrentes ou sinais competitivos no contexto.

Para enriquecer sem NewsAPI, inserir em `company_memory` linhas com `category` `market` ou `competitor`.

---

## 8. Auth (opcional mas recomendado)

1. No Supabase → Authentication, ative Email/Password.
2. Use `/login` e `/onboarding`.
3. O `middleware.ts` já refresca a sessão.

---

## 9. Deploy (Vercel ou similar)

1. Ligue o repositório.
2. Copie **todas** as variáveis de `.env.local` para o painel do host (sem prefixar `SUPABASE_SERVICE_ROLE_KEY` com `NEXT_PUBLIC_`).
3. Atualize os redirect URIs OAuth para o domínio de produção:
   - Google: `https://<dominio>/api/integrations/google/oauth/callback`
   - Meta: `https://<dominio>/api/integrations/meta/oauth/callback`
4. Rode as migrations no projeto Supabase de produção.
5. Deploy e teste `/onboarding` → `/samuel-ai` → cada integração.

---

## 10. Validação rápida

| Passo | Esperado |
|-------|----------|
| `/onboarding` cria empresa | Redireciona para `/samuel-ai?companyId=...` |
| Chat Samuel | Responde com LLM se `OPENAI_API_KEY` |
| Google connect | Painel Workspace “ativo” |
| Meta connect | Secção Meta com scores |
| LinkedIn env | Secção LinkedIn com scores |
| CRM | Scores quando há contacts/leads/deals |
| Sem token | Empty state com instruções (nunca mock) |

---

## Rotas úteis

- `/` — Home / portfolio
- `/onboarding` — criar empresa + conta
- `/login` — autenticação
- `/samuel-ai?companyId=` — workspace executivo
- `/integrations/google/connect`
- `/integrations/meta/connect`
- `/integrations/linkedin/connect`
