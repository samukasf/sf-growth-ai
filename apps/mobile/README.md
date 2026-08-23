# Samuel IA Mobile

Cliente nativo iOS/Android do mesmo backend do SF Growth AI.

## Objetivo

- conversa por voz contínua via WebRTC;
- microfone e áudio nativos, sem depender de `speechSynthesis` do navegador;
- interrupção da resposta do Samuel;
- mute/unmute durante a sessão;
- transcrição da conversa;
- chat textual usando o mesmo endpoint e histórico do Samuel;
- interface imersiva com partículas luminosas e estados claros.

## Desenvolvimento

Este app usa `react-native-webrtc`, portanto precisa de **development build**; ele não roda no Expo Go padrão.

```bash
cd apps/mobile
npm install
npx expo prebuild
npm run ios
# ou
npm run android
```

Para builds distribuíveis:

```bash
npx eas build --profile preview --platform ios
npx eas build --profile preview --platform android
```

A URL do backend usada pelo app é `https://sf-growth-ai.vercel.app`.

## Segurança

As chaves dos provedores de IA permanecem exclusivamente no backend. O app envia a oferta WebRTC ao endpoint seguro `/api/samuel-ai/realtime/offer`; nenhuma `OPENAI_API_KEY` ou `GEMINI_API_KEY` é incorporada no binário móvel.
