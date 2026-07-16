# Relatório de capacidades do Samuel AI

Atualizado em 16 de julho de 2026.

## Experiência executiva

- Interface responsiva para celular, tablet e desktop.
- Holograma com estados de repouso, escuta, processamento, fala, execução, alerta, erro e celebração.
- Movimento facial moderado, piscar natural, brilho dos olhos somente com as pálpebras abertas e boca orientada pela amplitude real do áudio.
- Conversa textual com streaming, histórico local e remoto, memória de contexto, destaque palavra por palavra durante a fala e fallback quando um provedor está indisponível.
- Motor de iniciativa baseado em sinais reais de agenda, e-mail, leads, campanhas, deploys e tarefas; não produz alertas aleatórios.

## Voz

- Voz neural masculina em português brasileiro com Piper/VITS, executada localmente no aparelho depois do primeiro carregamento.
- Cache do modelo no navegador, indicador de progresso e análise de amplitude para movimentação da boca.
- Fallback para uma voz masculina explícita do sistema; vozes neutras ou femininas não são selecionadas por suposição.
- Voz Realtime via WebRTC continua opcional. Se estiver indisponível, chat, ditado e leitura neural local permanecem funcionais.
- Reprodução automática respeita as restrições do iOS/Android e oferece um botão de ativação quando o celular bloqueia autoplay.

## Samuel Studio

- Criação de sites e aplicativos React a partir de uma descrição em linguagem natural.
- Reutilização do AI Gateway/GPT-OSS já configurado, somente no servidor e sem expor a chave ao navegador.
- Validação do código gerado, bloqueio de acesso externo na prévia e fallback local funcional se o Gateway falhar.
- Editor de código e prévia ao vivo em sandbox com Sandpack.
- Refinamento do projeto por novos pedidos, histórico local dos últimos projetos, cópia do código e exportação de projeto Vite em ZIP.
- Estrutura preparada para conectar um backend OpenHands próprio no futuro; ele não é apresentado como ativo sem URL e credencial configuradas.

## Integrações empresariais

- Google Workspace: Gmail, Google Calendar, Google Drive e Google Contacts, com estados reais de conexão e erros visíveis.
- Vercel: monitor de deploy com status do último deployment e sinal de iniciativa quando houver falha real.
- Supabase: banco, autenticação, histórico remoto e infraestrutura de integrações quando as variáveis do ambiente estão configuradas.
- Módulos executivos para marketing, vendas/CRM, finanças, operações, pessoas, jurídico, Google Business, Google Analytics, Search Console, Meta e LinkedIn.

## Segurança e limites honestos

- Segredos permanecem no servidor.
- O código do Studio executa dentro de uma sandbox e não pode usar `fetch`, WebSocket, cookies, `eval`, janelas pai ou recursos remotos.
- Integrações externas só aparecem como ativas após confirmação técnica; configuração pendente não é simulada.
- A criação do Studio produz front-ends funcionais. Publicação automática, banco próprio do projeto gerado e execução autônoma em repositórios exigem uma etapa posterior de infraestrutura e permissões específicas.
