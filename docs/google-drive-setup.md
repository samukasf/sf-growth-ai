# Google Drive — Setup Operacional (Sprint 91)

## Pré-requisitos no Google Cloud Console

1. Abra [Google Cloud Console](https://console.cloud.google.com/) → projeto do OAuth existente.
2. **APIs & Services → Library** → pesquise **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen** → confirme que o app inclui o scope:
   - `https://www.googleapis.com/auth/drive.readonly`
4. **APIs & Services → Credentials** → OAuth 2.0 Client ID (Web) já usado pelo Samuel.

## Variáveis de ambiente (`.env.local`)

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/gmail/callback
SUPABASE_SERVICE_ROLE_KEY=...   # obrigatório para tokens OAuth
```

Kill-switch (opcional):

```env
# SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED=false
```

## Reconexão OAuth (obrigatória após adicionar scope Drive)

1. Inicie o app: `npm run dev`
2. Acesse: `http://localhost:3000/debug/gmail-connect`
3. Informe o **Company ID** (UUID de `public.companies`)
4. Clique em conectar → autorize no Google (inclui Drive)
5. Confirme redirect com `?connected=true`

O fluxo reutiliza `google_oauth_connections` e `include_granted_scopes=true` — scopes anteriores (Gmail, Calendar, Contacts) são preservados.

## Validação automatizada (opcional)

Com credenciais reais configuradas:

```bash
RUN_GOOGLE_DRIVE_OPS_VALIDATION=true COMPANY_ID=<uuid-da-empresa> npm test -- --run features/google-drive/google-drive.ops-validation.test.ts
```

O teste verifica:

- Scope `drive.readonly` na URL de autorização
- Token OAuth na tabela `google_oauth_connections`
- Listagem real de arquivos via Drive API

## Teste manual no Playground

1. `npm run dev`
2. Acesse: `http://localhost:3000/debug/samuel-playground`
3. Envie: `Leia o documento <NOME> no Drive.`
4. No **Pipeline Inspector**:
   - **Tool Execution** → `google-drive` / `drive_read_doc`
   - **Conteúdo lido** → Sim
5. A narrativa final **não** deve conter JSON bruto (`"fileCount"`, `"mimeType"`).

## Formatos suportados

| Formato | Método |
|---------|--------|
| Google Docs / Sheets / Slides | `files.export` (text/plain ou CSV) |
| PDF | `pdfjs-dist` após `files.get?alt=media` |
| DOCX | `mammoth` |
| XLSX | `xlsx` (SheetJS) |
| PPTX | `jszip` + extração XML |

Limites de proteção:

- Download máximo: **15 MB** (`DRIVE_MAX_DOWNLOAD_BYTES`)
- Texto para AI Gateway: **8 000 caracteres** (`DRIVE_MAX_CONTENT_CHARS`)

## Rollback

```env
SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED=false
```

Nenhuma migração de banco é necessária.
