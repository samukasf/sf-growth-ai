import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { fromByteArray } from "base64-js";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./src/supabase";
import {
  cancelDesktopCommand,
  executeDesktopCommand,
  generateSpeech,
  isLikelyDesktopCommand,
  loadBootstrap,
  sendSamuelTurn,
  transcribeNativeAudio,
  type MobileMessage,
  type SamuelBootstrap,
} from "./src/samuel-api";

const COMPANY_ID = "default-company";

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function message(role: MobileMessage["role"], content: string): MobileMessage {
  return { id: id(), role, content, timestamp: new Date().toISOString() };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrap, setBootstrap] = useState<SamuelBootstrap | null>(null);
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState("Pronto");
  const speakingSound = useRef<Audio.Sound | null>(null);
  const activeDesktopCommandId = useRef<string | null>(null);

  const token = session?.access_token ?? "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setBootstrap(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) return;
    loadBootstrap(token, COMPANY_ID)
      .then((value) => {
        setBootstrap(value);
        setStatus(`Samuel ativo · ${value.voice.persona}`);
      })
      .catch((error: Error) => setStatus(error.message));
  }, [token]);

  useEffect(() => {
    return () => {
      speakingSound.current?.unloadAsync().catch(() => undefined);
      recording?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, [recording]);

  const connectedCapabilities = useMemo(
    () => bootstrap?.capabilities.filter((capability) => capability.availability === "connected").length ?? 0,
    [bootstrap],
  );

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setStatus(error.message);
  }

  async function speak(text: string) {
    if (!token || !text.trim()) return;
    try {
      setStatus("Falando");
      const bytes = await generateSpeech(token, text, COMPANY_ID);
      const uri = `${FileSystem.cacheDirectory}samuel-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(uri, fromByteArray(bytes), {
        encoding: FileSystem.EncodingType.Base64,
      });
      await speakingSound.current?.unloadAsync().catch(() => undefined);
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      speakingSound.current = sound;
      sound.setOnPlaybackStatusUpdate((playback) => {
        if (playback.isLoaded && playback.didJustFinish) setStatus("Pronto");
      });
    } catch {
      setStatus("Resposta pronta · voz indisponível");
    }
  }

  async function runTurn(text: string) {
    const query = text.trim();
    if (!query || !token || busy) return;

    const userMessage = message("user", query);
    const previousHistory = messages;
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);
    setStatus("Pensando");

    try {
      let answer: string;
      if (isLikelyDesktopCommand(query)) {
        setStatus("Executando no computador");
        answer = await executeDesktopCommand(token, query, COMPANY_ID, (commandId) => {
          activeDesktopCommandId.current = commandId;
        });
      } else {
        const turn = await sendSamuelTurn({
          token,
          query,
          companyId: COMPANY_ID,
          conversationId,
          history: [...previousHistory, userMessage],
        });
        setConversationId(turn.conversationId);
        answer = turn.content || "Não recebi uma resposta conclusiva.";
      }

      setMessages((current) => [...current, message("assistant", answer)]);
      await speak(answer);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha ao executar o turno.";
      setMessages((current) => [...current, message("assistant", text)]);
      setStatus(text);
    } finally {
      activeDesktopCommandId.current = null;
      setBusy(false);
    }
  }

  async function toggleRecording() {
    if (!token || busy) return;

    if (recording) {
      setStatus("Entendendo sua voz");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) {
        setStatus("Áudio não disponível");
        return;
      }
      try {
        const transcript = await transcribeNativeAudio(token, uri, COMPANY_ID);
        await runTurn(transcript);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Falha na transcrição.");
      }
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setStatus("Permissão de microfone necessária");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    const next = new Audio.Recording();
    await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await next.startAsync();
    setRecording(next);
    setStatus("Ouvindo");
  }

  async function stopSamuel() {
    await speakingSound.current?.stopAsync().catch(() => undefined);
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => undefined);
      setRecording(null);
    }

    const commandId = activeDesktopCommandId.current;
    if (commandId && token) {
      setStatus("Interrompendo execução no computador");
      await cancelDesktopCommand(token, commandId).catch(() => undefined);
      activeDesktopCommandId.current = null;
    }
    setStatus("Interrompido");
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loginCard}>
          <Text style={styles.brand}>SAMUEL AI</Text>
          <Text style={styles.title}>Presença executiva</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="E-mail"
            placeholderTextColor="#66839a"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            secureTextEntry
            placeholder="Senha"
            placeholderTextColor="#66839a"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={signIn} disabled={busy}>
            {busy ? <ActivityIndicator /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
          </Pressable>
          <Text style={styles.status}>{status}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SAMUEL AI</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
          <Pressable style={styles.stopButton} onPress={stopSamuel}>
            <Text style={styles.stopText}>STOP</Text>
          </Pressable>
        </View>

        <View style={styles.coreWrap}>
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringInner]} />
          <View style={styles.core}>
            <Text style={styles.coreText}>{recording ? "OUVINDO" : busy ? "ATIVO" : "SAMUEL"}</Text>
          </View>
        </View>

        <Text style={styles.capabilityText}>
          Núcleo compartilhado · {connectedCapabilities} capacidades conectadas · Desktop {bootstrap?.interaction.desktopControl ? "ativo" : "indisponível"}
        </Text>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View style={[styles.message, item.role === "user" ? styles.userMessage : styles.samuelMessage]}>
              <Text style={styles.messageRole}>{item.role === "user" ? "VOCÊ" : "SAMUEL"}</Text>
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            placeholder="Fale ou escreva para Samuel…"
            placeholderTextColor="#66839a"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => runTurn(input)}
            editable={!busy}
            style={[styles.input, styles.composerInput]}
          />
          <Pressable
            style={[styles.micButton, recording && styles.micButtonActive]}
            onPress={toggleRecording}
            disabled={busy}
          >
            <Text style={styles.micText}>{recording ? "■" : "●"}</Text>
          </Pressable>
          <Pressable style={styles.sendButton} onPress={() => runTurn(input)} disabled={busy || !input.trim()}>
            <Text style={styles.sendText}>Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020b12" },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 },
  brand: { color: "#5ee8ff", fontSize: 14, fontWeight: "800", letterSpacing: 3 },
  title: { color: "#ffffff", fontSize: 30, fontWeight: "800", marginVertical: 18 },
  status: { color: "#8fb0c9", fontSize: 13, marginTop: 6 },
  loginCard: { margin: 22, marginTop: 120, padding: 22, borderWidth: 1, borderColor: "#124d70", borderRadius: 24, backgroundColor: "#061724" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#174e6f", borderRadius: 14, color: "white", paddingHorizontal: 14, backgroundColor: "#071b29", marginBottom: 12 },
  primaryButton: { minHeight: 50, borderRadius: 14, backgroundColor: "#1479e8", alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "white", fontWeight: "800", fontSize: 16 },
  stopButton: { borderWidth: 1, borderColor: "#9d3440", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  stopText: { color: "#ff7c88", fontWeight: "900", letterSpacing: 1 },
  coreWrap: { height: 180, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1, borderColor: "#1689bd", borderRadius: 999 },
  ringOuter: { width: 150, height: 150, opacity: 0.35 },
  ringInner: { width: 116, height: 116, opacity: 0.65 },
  core: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#0c5dad", borderWidth: 1, borderColor: "#5ee8ff", alignItems: "center", justifyContent: "center" },
  coreText: { color: "white", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  capabilityText: { color: "#6fa7c4", fontSize: 11, textAlign: "center", marginBottom: 10 },
  messages: { paddingVertical: 8, gap: 10 },
  message: { maxWidth: "88%", borderRadius: 16, padding: 12, borderWidth: 1 },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#103454", borderColor: "#1d6699" },
  samuelMessage: { alignSelf: "flex-start", backgroundColor: "#071a24", borderColor: "#155a70" },
  messageRole: { color: "#5ee8ff", fontSize: 9, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  messageText: { color: "#eef8ff", fontSize: 15, lineHeight: 21 },
  composer: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8 },
  composerInput: { flex: 1, marginBottom: 0 },
  micButton: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#0d4564", borderWidth: 1, borderColor: "#2db8ea" },
  micButtonActive: { backgroundColor: "#a72d3c", borderColor: "#ff7987" },
  micText: { color: "white", fontSize: 18 },
  sendButton: { height: 48, borderRadius: 14, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#1479e8" },
  sendText: { color: "white", fontWeight: "800" },
});
