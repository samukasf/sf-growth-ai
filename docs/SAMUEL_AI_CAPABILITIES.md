# Relatório de capacidades e dados reais do Samuel AI

Atualizado em 16 de julho de 2026.

## Regra de produção

O painel `/samuel-ai` opera em modo **real-only**. Uma integração só recebe o estado
`Conectado` depois de uma credencial válida e de uma consulta bem-sucedida ao
provedor. Ausência de credencial, token expirado, erro de rede ou permissão
insuficiente produz `Configurar`/erro visível; nunca números de demonstração.

Fixtures e adaptadores `mock`/`noop` que ainda existem no repositório são usados por
testes ou módulos experimentais não expostos como capacidade ativa. Eles não
alimentam a página de produção do Samuel.

## Experiência executiva

- Interface responsiva para celular, tablet e desktop.
- Samuel Core vetorial, sem boca ou olhos artificiais sobrepostos a uma fotografia.
- Estados visuais de repouso, escuta, processamento, fala, execução, alerta, erro e
  celebração por meio do visor, núcleo, partículas e forma de onda.
- A forma de onda e a intensidade do visor usam a amplitude do áudio reproduzido.
- Chat textual com streaming, histórico local/remoto, contexto empresarial e
  destaque palavra por palavra durante a leitura da resposta.
- Iniciativa baseada em eventos consultados: Agenda, Gmail, deploy da Vercel,
  CRM, campanhas e tarefas. Sem um sinal verificável, o Samuel não inventa alertas.

## Voz

- Voz neural local masculina `pt_BR-faber-medium`, com reprodução mais grave,
  equalização de graves, compressão e ritmo executivo.
- Fallback do navegador somente quando uma voz em português identificada como
  masculina está disponível; o sistema não escolhe uma voz neutra por suposição.
- Voz Realtime usa WebRTC, `gpt-realtime-2.1` e a voz `cedar`, com equalização de
  saída. Ela requer `OPENAI_API_KEY`, acesso ao modelo e crédito de API válidos.
- Restrições de autoplay do iOS continuam sendo respeitadas: a primeira reprodução
  pode exigir um toque do usuário.

## Samuel Studio

- Criação e refinamento de sites e aplicativos React por meio do AI Gateway/GPT-OSS.
- O resultado abre primeiro como experiência navegável, com botão de tela cheia;
  o código é uma visualização secundária.
- O prompt exige menu/abas funcionais, no mínimo três áreas em aplicativos, CTAs
  ativos, formulários validados e operações locais reais de criar/editar/filtrar/remover.
- Prévia isolada com Sandpack, editor, histórico local, cópia e ZIP Vite executável.
- Se o Gateway falhar, o starter local continua navegável e identifica claramente
  que não executa envios externos.
- Publicação automática de cada projeto gerado ainda exige um token de deploy e um
  projeto de destino com escopo limitado; até essa configuração, a entrega real é a
  prévia navegável e o ZIP completo.

## Matriz de integrações

| Capacidade | Estado de produção | Operações reais disponíveis |
| --- | --- | --- |
| AI Gateway / GPT-OSS | Ativo quando as três variáveis `AI_GATEWAY_*` respondem | Chat e geração/refino no Studio |
| Supabase | Ativo quando URL, chave pública e chave de serviço respondem | Dados empresariais, CRM, módulos executivos, histórico e ações da inbox |
| Gmail | Conectado e consultado pelo OAuth da empresa | Perfil, mensagens, não lidos; cliente também suporta rascunho, envio e resposta, mas o chat não envia sem uma ação explícita confirmada |
| Google Agenda | Conectado e consultado pelo OAuth da empresa | Eventos, disponibilidade; provider suporta criar, editar e excluir mediante fluxo confirmado |
| Google Drive | Conectado e consultado pelo OAuth da empresa | Busca, recentes, leitura, exportação e download |
| Google Contacts | Conectado e consultado pelo OAuth da empresa | Consulta de contatos |
| Vercel | Monitor real por GitHub/Vercel | Estado de deploy, link e alerta de falha |
| Google Analytics | Condicional | Dados GA4 somente depois de token e Property ID validados |
| Search Console | Condicional | Dados SEO somente depois de token e Site URL validados |
| Google Business | Condicional | Perfil/reviews/performance somente depois das credenciais validadas |
| Meta / Instagram | Condicional | Dados Graph/Ads somente depois de token, Page ID e permissões validados |
| LinkedIn | Não conectado | O painel permanece em `Configurar`; nenhum número fictício é exibido |
| OpenHands | Opcional, não conectado | Só fica ativo com backend próprio e chave válidos |

## Limites de autorização

A autorização do proprietário não substitui as autorizações técnicas de terceiros.
Cada rede social exige OAuth, escopos, conta profissional e, em alguns casos,
revisão do aplicativo. O navegador do iPhone permite microfone, câmera, partilha,
notificações e instalação web conforme as permissões concedidas; controle completo
do aparelho, de outros aplicativos ou do sistema operacional requer um aplicativo
iOS nativo com App Intents/Shortcuts e consentimento específico do aparelho.

O Samuel não afirma ter executado uma ação externa sem confirmação da API. Ações
com efeito sobre outras pessoas — enviar mensagem, publicar, apagar, pagar ou
convidar — devem mostrar o destinatário/conta, o conteúdo e o resultado real.

## Verificação desta versão

- TypeScript sem erros.
- 77 testes automatizados aprovados.
- ESLint sem erros (o repositório mantém avisos antigos em módulos `noop` fora do
  runtime principal).
- Build Next.js de produção aprovado.
