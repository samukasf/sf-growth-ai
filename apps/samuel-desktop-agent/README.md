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

## Arquitetura

Consulte `docs/samuel-computer-agent-architecture.md` para a arquitetura completa e política de risco.
