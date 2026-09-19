# Samuel Desktop Agent

Aplicativo Windows do SF Growth AI que permite ao Samuel executar tarefas reais no computador mediante pareamento e autorização explícita.

## O que esta versão faz

- Pareamento por código de 8 dígitos com a conta autenticada do SF Growth AI.
- Conexão somente de saída para `https://sf-growth-ai.vercel.app`; nenhuma porta de controle é aberta na rede local.
- Token e segredo do dispositivo armazenados via Electron `safeStorage`/Windows DPAPI.
- Fila de comandos assinados com HMAC, expiração e vínculo ao usuário.
- Inventário de janelas e processos visíveis.
- Abrir aplicativos e focar janelas.
- Capturar a tela principal e gerar hash SHA-256 como evidência.
- Mouse: clique, duplo clique e scroll.
- Teclado: digitação e atalhos.
- Abrir URLs HTTP/HTTPS no navegador padrão.
- Leitura e gravação direta apenas em pastas autorizadas pelo usuário no próprio aplicativo.
- `computer.task`: loop visual captura → decisão → uma ação → nova captura → verificação.
- Resultado só é marcado como `verified` quando existe evidência devolvida ao servidor.
- Pause/Resume local, Pause/Resume remoto e remoção do dispositivo.
- `STOP SAMUEL` no aplicativo/bandeja e atalho global `Ctrl + Alt + Esc`.
- Log local JSONL de execução em `userData` do aplicativo.
- Ponte local com ComfyUI para gerar vídeo sem expor a API local à internet.
- Upload do MP4 final por URL assinada temporária; nenhuma chave Supabase é enviada ao desktop.
- Seleção de workflow ComfyUI diretamente no Samuel Desktop.

## ComfyUI · vídeo local

O ComfyUI continua escutando somente no próprio computador. O SF Growth AI envia uma ordem assinada ao Samuel Desktop; o agente chama a API local do ComfyUI, acompanha o `prompt_id`, recolhe o MP4 e envia o arquivo final ao workspace por uma URL assinada temporária.

Configuração inicial:

1. Instale/abra o ComfyUI e confirme que a interface local responde em `http://127.0.0.1:8188`.
2. Monte o workflow de vídeo com o modelo que deseja usar.
3. Exporte o workflow em **formato API JSON**.
4. No Samuel Desktop, clique em **Workflow** na seção **ComfyUI · motor de vídeo local** e selecione esse JSON.
5. Mantenha o ComfyUI aberto quando escolher **ComfyUI local** no AI Video Director.

O agente substitui estes placeholders no workflow antes de enviá-lo ao ComfyUI:

- `{{PROMPT}}`
- `{{NEGATIVE_PROMPT}}`
- `{{WIDTH}}` / `{{HEIGHT}}`
- `{{FPS}}` / `{{FRAMES}}` / `{{DURATION_SECONDS}}`
- `{{SEED}}`
- `{{REFERENCE_IMAGE}}` — nome da imagem enviada ao diretório de input do ComfyUI.
- `{{OUTPUT_PREFIX}}`
- `{{VOICE_PROVIDER}}` / `{{VOICE_ID}}` / `{{VOICE_NAME}}` — voz selecionada no painel para workflows que possuam etapa de locução/TTS.

O nó final do workflow deve salvar um arquivo `.mp4`. Se o workflow terminar sem MP4, o agente devolve erro verificável em vez de marcar a tarefa como concluída.

## Voz

No SF Growth AI, a sessão OpenAI Realtime recebe a ferramenta `computer_task`. Quando o usuário dá um comando explícito por voz para operar o computador, o Samuel:

1. transforma o pedido falado em um objetivo operacional;
2. envia a tarefa ao computador pareado;
3. o agente local executa em passos supervisionados;
4. o navegador espera o estado final da tarefa;
5. o Samuel só responde como concluído quando o comando volta `verified` com evidência.

Interromper a conversa cancela o comando no servidor; em tarefas visuais o próximo passo é recusado e o agente local para.

## Pareamento

1. Instale e abra **Samuel Desktop** no Windows.
2. O aplicativo mostra um código de 8 dígitos válido por 10 minutos.
3. Entre no SF Growth AI e abra `/samuel-ai/desktop`.
4. Digite o código e clique em **Parear Samuel Desktop**.
5. O aplicativo muda para **Conectado** e começa a receber tarefas autorizadas.

## Pastas

Acesso direto a arquivos é `default deny`. Clique em **+ Pasta** no Samuel Desktop para autorizar uma pasta específica. Caminhos são validados com `realpath` para impedir escape por links/symlinks.

O modo visual de computer use pode interagir com o que estiver visível na tela dentro do objetivo específico aprovado, mas não recebe automaticamente conteúdo de arquivos fora dessas pastas.

## Takeover obrigatório

O controlador visual é instruído a parar e devolver falha/takeover quando a tarefa chegar a:

- senha ou segredo;
- CAPTCHA;
- biometria;
- autenticação de dois fatores;
- pagamento/compra;
- mudança de segurança ou credenciais.

Esses dados não devem ser enviados ao modelo nem aos logs do SF Growth AI.

## Desenvolvimento

Requer Node.js 22 e Windows para teste do agente real.

```powershell
cd apps/samuel-desktop-agent
npm install
npm run build
npm start
```

Gerar instalador NSIS x64:

```powershell
npm run dist:win
```

O artefato sai em `release/Samuel-Desktop-Setup-<version>.exe`.

## CI / instalador

`.github/workflows/samuel-desktop-windows.yml` compila o TypeScript e gera o instalador em `windows-latest`, publicando o artefato **Samuel-Desktop-Windows** no GitHub Actions.

A primeira versão é funcionalmente instalável, porém **não possui assinatura Authenticode** enquanto não houver um certificado de code signing configurado no repositório. Por isso o Windows SmartScreen pode exibir um aviso de editor desconhecido. A assinatura deve ser adicionada antes de distribuição comercial ampla.

## Variáveis

No cloud SF Growth AI:

- `OPENAI_API_KEY` — usada pelo loop visual e pela voz Realtime.
- `OPENAI_COMPUTER_MODEL` — modelo visual do controlador; se vazio, herda `OPENAI_MODEL` e depois usa o fallback definido no servidor.
- `OPENAI_REALTIME_MODEL` — modelo de voz Realtime.

No agente local, opcionalmente:

- `SAMUEL_DESKTOP_BASE_URL` — substitui o endpoint cloud; padrão `https://sf-growth-ai.vercel.app`.
- `SAMUEL_COMFYUI_URL` — endpoint local; padrão `http://127.0.0.1:8188`. Por segurança, o agente aceita apenas loopback.
- `SAMUEL_COMFYUI_VIDEO_WORKFLOW` — caminho alternativo para o workflow API JSON. O seletor do aplicativo é o método recomendado.
- `SAMUEL_COMFYUI_TIMEOUT_MS` — limite da geração local; padrão 45 minutos, máximo 55 minutos.

## Arquitetura

Consulte `docs/samuel-computer-agent-architecture.md` para a arquitetura completa e política de risco.
