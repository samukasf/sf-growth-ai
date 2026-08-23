import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { loadConversation, sendMessage, type MobileChatMessage } from "./src/api";
import { SamuelRealtimeVoice, type VoiceStatus } from "./src/realtime";

const COMPANY_ID = "sf-growth-ai-mobile";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "Disponível",
  requesting: "Aguardando microfone",
  connecting: "Conectando voz",
  listening: "Ouvindo",
  processing: "Pensando",
  speaking: "Falando",
  error: "Voz indisponível",
};

function Particle({ index }: { index: number }) {
  const motion = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const left = `${(index * 37) % 96}%` as const;
  const top = `${(index * 53) % 92}%` as const;
  const size = 2 + (index % 4) * 1.2;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(motion, {
            toValue: 1,
            duration: 7000 + (index % 7) * 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(motion, {
            toValue: 0,
            duration: 7000 + (index % 7) * 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800 + (index % 5) * 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1800 + (index % 5) * 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [index, motion, pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left,
          top,
          width: size,
          height: size,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.92] }),
          transform: [
            { translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-12, 18] }) },
            { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [14, -22] }) },
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.7] }) },
          ],
        },
      ]}
    />
  );
}

function SamuelCore({ status }: { status: VoiceStatus }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const active = status === "listening" || status === "processing" || status === "speaking";
  return (
    <View style={styles.coreWrap}>
      <Animated.View
        style={[
          styles.coreHalo,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: active ? [0.18, 0.62] : [0.08, 0.24] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.18] }) }],
          },
        ]}
      />
      <View style={styles.core}>
        <View style={styles.coreInner} />
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: MobileChatMessage }) {
  const user = message.role === "user";
  return (
    <View style={[styles.message, user ? styles.userMessage : styles.samuelMessage]}>
      <Text style={styles.messageAuthor}>{user ? "Você" : "Samuel"}</Text>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );
}

export default function App() {
  const [messages, setMessages] = useState<MobileChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const voiceRef = useRef<SamuelRealtimeVoice | null>(null);

  useEffect(() => {
    void loadConversation(COMPANY_ID)
      .then((history) => {
        setConversationId(history.conversationId);
        setMessages(history.messages);
      })
      .catch(() => undefined);
    return () => voiceRef.current?.stop();
  }, []);

  const voiceActive = voiceStatus !== "idle" && voiceStatus !== "error";

  const appendVoiceTranscript = (role: "user" | "assistant", content: string, final: boolean) => {
    if (!final || !content.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: `voice-${role}-${Date.now()}`,
        role,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const toggleVoice = async () => {
    if (voiceActive) {
      voiceRef.current?.stop();
      voiceRef.current = null;
      setMuted(false);
      return;
    }
    setVoiceError(null);
    const voice = new SamuelRealtimeVoice({
      companyId: COMPANY_ID,
      conversationId,
      onStatus: setVoiceStatus,
      onTranscript: (event) => appendVoiceTranscript(event.role, event.content, event.final),
      onError: setVoiceError,
    });
    voiceRef.current = voice;
    try {
      await voice.start();
    } catch {
      voiceRef.current = null;
    }
  };

  const submit = async () => {
    const query = input.trim();
    if (!query || sending) return;
    const userMessage: MobileChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };
    setInput("");
    setSending(true);
    setMessages((current) => [...current, userMessage]);
    try {
      const result = await sendMessage({
        companyId: COMPANY_ID,
        query,
        conversationId,
        history: [...messages, userMessage],
      });
      setConversationId(result.conversationId);
      setMessages((current) => [...current, result.message]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "Não foi possível concluir a resposta.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const particles = useMemo(() => Array.from({ length: 28 }, (_, index) => index), []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.background}>
          {particles.map((index) => <Particle key={index} index={index} />)}
        </View>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>SAMUEL IA</Text>
              <Text style={styles.title}>Conversa operacional</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, voiceStatus === "error" && styles.statusDotError]} />
              <Text style={styles.statusText}>{STATUS_LABEL[voiceStatus]}</Text>
            </View>
          </View>

          <SamuelCore status={voiceStatus} />

          <Text style={styles.presenceText}>
            {voiceStatus === "speaking"
              ? "Samuel está respondendo"
              : voiceStatus === "processing"
                ? "Samuel está processando o contexto"
                : voiceStatus === "listening"
                  ? "Fale naturalmente. Pode interromper quando quiser."
                  : "Toque no núcleo de voz para iniciar uma conversa contínua."}
          </Text>

          <View style={styles.voiceActions}>
            <Pressable style={[styles.primaryButton, voiceActive && styles.stopButton]} onPress={toggleVoice}>
              <Text style={styles.primaryButtonText}>{voiceActive ? "Encerrar voz" : "Iniciar voz"}</Text>
            </Pressable>
            {voiceActive ? (
              <>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    const next = !muted;
                    setMuted(next);
                    voiceRef.current?.setMuted(next);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>{muted ? "Ativar microfone" : "Silenciar"}</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => voiceRef.current?.interrupt()}>
                  <Text style={styles.secondaryButtonText}>Interromper</Text>
                </Pressable>
              </>
            ) : null}
          </View>

          {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

          <View style={styles.transcriptPanel}>
            <FlatList
              data={messages.slice(-12)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escreva para o Samuel..."
              placeholderTextColor="#777b83"
              multiline
              style={styles.input}
              editable={!sending}
              returnKeyType="send"
              onSubmitEditing={() => void submit()}
            />
            <Pressable style={styles.sendButton} onPress={() => void submit()} disabled={sending}>
              <Text style={styles.sendButtonText}>{sending ? "…" : "Enviar"}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050607" },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: "#050607", overflow: "hidden" },
  particle: {
    position: "absolute",
    borderRadius: 99,
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOpacity: 0.9,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: "#969ba3", fontSize: 11, letterSpacing: 3, fontWeight: "700" },
  title: { color: "#f5f6f7", fontSize: 22, fontWeight: "700", marginTop: 4 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statusDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: "#d7d9dc" },
  statusDotError: { backgroundColor: "#ff5a67" },
  statusText: { color: "#d7d9dc", fontSize: 11, fontWeight: "600" },
  coreWrap: { height: 180, alignItems: "center", justifyContent: "center" },
  coreHalo: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  core: {
    width: 92,
    height: 92,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  coreInner: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#f4f5f6",
    shadowColor: "#ffffff",
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  presenceText: { color: "#a8adb4", textAlign: "center", fontSize: 13, marginTop: -8, marginBottom: 12 },
  voiceActions: { flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  primaryButton: { backgroundColor: "#f2f3f4", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 },
  stopButton: { backgroundColor: "#202226", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  primaryButtonText: { color: "#08090a", fontWeight: "700", fontSize: 13 },
  secondaryButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  secondaryButtonText: { color: "#d9dce0", fontWeight: "600", fontSize: 12 },
  errorText: { color: "#ff838d", fontSize: 12, textAlign: "center", marginBottom: 8 },
  transcriptPanel: { flex: 1, minHeight: 150, borderRadius: 24, overflow: "hidden", backgroundColor: "rgba(10,11,13,0.76)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  messagesContent: { padding: 12, gap: 9 },
  message: { maxWidth: "88%", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 },
  userMessage: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.12)" },
  samuelMessage: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  messageAuthor: { color: "#8f949c", fontSize: 10, fontWeight: "700", letterSpacing: 0.7, marginBottom: 4, textTransform: "uppercase" },
  messageText: { color: "#eef0f2", fontSize: 14, lineHeight: 20 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 10 },
  input: { flex: 1, minHeight: 46, maxHeight: 100, borderRadius: 22, paddingHorizontal: 15, paddingVertical: 12, color: "#f4f5f6", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", fontSize: 14 },
  sendButton: { minHeight: 46, justifyContent: "center", borderRadius: 22, paddingHorizontal: 16, backgroundColor: "#f1f2f3" },
  sendButtonText: { color: "#08090a", fontWeight: "800", fontSize: 13 },
});
