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
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "./src/supabase";
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
const VOICE_SILENCE_MS = 900;
const VOICE_MAX_SEGMENT_MS = 20_000;
const VOICE_MIN_SEGMENT_MS = 650;
const VOICE_METER_THRESHOLD_DB = -42;

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function message(role: MobileMessage["role"], content: string): MobileMessage {
  return { id: id(), role, content, timestamp: new Date().toISOString() };
}

export default function App() {
  const [authClient, setAuthClient] = useState<SupabaseClient | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrap, setBootstrap] = useState<SamuelBootstrap | null>(null);
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLoop, setVoiceLoop] = useState(false);
  const [status, setStatus] = useState("Inicializando");

  const speakingSound = useRef<Audio.Sound | null>(null);
  const activeDesktopCommandId = useRef<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const finalizingRecordingRef = useRef(false);
  const busyRef = useRef(false);
  const voiceLoopRef = useRef(false);
  const speechStartedAtRef = useRef<number | null>(null);
  const lastSpeechAtRef = useRef<number | null>(null);
  const playbackSerialRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = session?.access_token ?? "";

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    getSupabaseClient()
      .then(async (client) => {
        if (!active) return;
        setAuthClient(client);

        const { data } = await client.auth.getSession();
        if (!active) return;
        setSession(data.session);
        setAuthReady(true);
        setStatus(data.session ? "Conectando ao Samuel" : "Pronto para entrar");

        const listener = client.auth.onAuthStateChange((_event, next) => {
          if (!active) return;
          setSession(next);
          if (!next) setBootstrap(null);
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();
      })
      .catch((error: Error) => {
        if (!active) return;
        setAuthReady(false);
        setStatus(error.message);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
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
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      playbackSerialRef.current += 1;
      speakingSound.current?.unloadAsync().catch(() => undefined);
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, []);

  const connectedCapabilities = useMemo(
    () => bootstrap?.capabilities.filter((capability) => capability.availability === "connected").length ?? 0,
    [bootstrap],
  );

  function setVoiceLoopEnabled(enabled: boolean) {
    voiceLoopRef.current = enabled;
    setVoiceLoop(enabled);
  }

  function scheduleVoiceLoopResume(delayMs = 300) {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      if (
        voiceLoopRef.current &&
        token &&
        !busyRef.current &&
        !recordingRef.current &&
        !speakingSound.current
      ) {
        void startRecording();
      }
    }, delayMs);
  }

  async function signIn() {
    if (!authClient) {
      setStatus("Autenticação ainda não inicializada");
      return;
    }
    setBusy(true);
    busyRef.current = true;
    const { error } = await authClient.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    busyRef.current = false;
    if (error) setStatus(error.message);
  }

  async function stopSpeech() {
    playbackSerialRef.current += 1;
    const sound = speakingSound.current;
    speakingSound.current = null;
    setSpeaking(false);
    if (!sound) return;
    await sound.stopAsync().catch(() => undefined);
    await sound.unloadAsync().catch(() => undefined);
  }

  async function speak(text: string) {
    if (!token || !text.trim()) {
      scheduleVoiceLoopResume();
      return;
    }

    const playbackSerial = playbackSerialRef.current + 1;
    playbackSerialRef.current = playbackSerial;
    let uri: string | null = null;

    try {
      setStatus("Preparando voz");
      const bytes = await generateSpeech(token, text, COMPANY_ID);
      uri = `${FileSystem.cacheDirectory}samuel-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(uri, fromByteArray(bytes), {
        encoding: FileSystem.EncodingType.Base64,
      });

      await stopSpeech();
      playbackSerialRef.current = playbackSerial;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      speakingSound.current = sound;
      setSpeaking(true);
      setStatus("Falando");

      sound.setOnPlaybackStatusUpdate((playback) => {
        if (!playback.isLoaded || !playback.didJustFinish) return;
        if (playbackSerialRef.current !== playbackSerial) return;

        speakingSound.current = null;
        setSpeaking(false);
        setStatus("Pronto");
        void sound.unloadAsync().catch(() => undefined);
        if (uri) void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
        scheduleVoiceLoopResume(220);
      });
    } catch {
      if (playbackSerialRef.current === playbackSerial) {
        speakingSound.current = null;
        setSpeaking(false);
        setStatus("Resposta pronta · voz indisponível");
        if (uri) void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
        scheduleVoiceLoopResume(450);
      }
    }
  }

  async function runTurn(text: string) {
    const query = text.trim();
    if (!query || !token || busyRef.current) return;

    const userMessage = message("user", query);
    const previousHistory = messages;
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);
    busyRef.current = true;
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
      setBusy(false);
      busyRef.current = false;
      await speak(answer);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Falha ao executar o turno.";
      setMessages((current) => [...current, message("assistant", text)]);
      setStatus(text);
      setBusy(false);
      busyRef.current = false;
      scheduleVoiceLoopResume(700);
    } finally {
      activeDesktopCommandId.current = null;
      if (busyRef.current) {
        setBusy(false);
        busyRef.current = false;
      }
    }
  }

  async function finalizeRecording(target: Audio.Recording) {
    if (recordingRef.current !== target || finalizingRecordingRef.current) return;
    finalizingRecordingRef.current = true;
    target.setOnRecordingStatusUpdate(null);
    setStatus("Entendendo sua voz");

    try {
      await target.stopAndUnloadAsync();
      const uri = target.getURI();
      recordingRef.current = null;
      setRecording(null);
      speechStartedAtRef.current = null;
      lastSpeechAtRef.current = null;

      if (!uri) {
        setStatus("Áudio não disponível");
        scheduleVoiceLoopResume(600);
        return;
      }

      const transcript = await transcribeNativeAudio(token, uri, COMPANY_ID);
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
      await runTurn(transcript);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha na transcrição.");
      scheduleVoiceLoopResume(700);
    } finally {
      finalizingRecordingRef.current = false;
    }
  }

  async function startRecording() {
    if (!token || recordingRef.current || finalizingRecordingRef.current || busyRef.current) return;

    if (speakingSound.current) await stopSpeech();
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceLoopEnabled(false);
      setStatus("Permissão de microfone necessária");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const next = new Audio.Recording();
      await next.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      next.setProgressUpdateInterval(120);
      next.setOnRecordingStatusUpdate((current) => {
        if (!current.isRecording || finalizingRecordingRef.current) return;
        const now = Date.now();
        const metering = typeof current.metering === "number" ? current.metering : -160;

        if (metering >= VOICE_METER_THRESHOLD_DB) {
          if (!speechStartedAtRef.current) speechStartedAtRef.current = now;
          lastSpeechAtRef.current = now;
        }

        const heardSpeech = speechStartedAtRef.current !== null;
        const lastSpeechAt = lastSpeechAtRef.current;
        const duration = current.durationMillis ?? 0;
        const silenceComplete =
          heardSpeech &&
          lastSpeechAt !== null &&
          now - lastSpeechAt >= VOICE_SILENCE_MS &&
          duration >= VOICE_MIN_SEGMENT_MS;

        if (silenceComplete || duration >= VOICE_MAX_SEGMENT_MS) {
          void finalizeRecording(next);
        }
      });
      await next.startAsync();
      speechStartedAtRef.current = null;
      lastSpeechAtRef.current = null;
      recordingRef.current = next;
      setRecording(next);
      setStatus("Ouvindo · fale normalmente");
    } catch (error) {
      recordingRef.current = null;
      setRecording(null);
      setVoiceLoopEnabled(false);
      setStatus(error instanceof Error ? error.message : "Não consegui abrir o microfone.");
    }
  }

  async function toggleRecording() {
    if (!token) return;

    const currentRecording = recordingRef.current;
    if (currentRecording) {
      await finalizeRecording(currentRecording);
      return;
    }

    if (busyRef.current && !speaking) return;
    setVoiceLoopEnabled(true);
    await startRecording();
  }

  async function stopSamuel() {
    setVoiceLoopEnabled(false);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    await stopSpeech();

    const currentRecording = recordingRef.current;
    recordingRef.current = null;
    setRecording(null);
    speechStartedAtRef.current = null;
    lastSpeechAtRef.current = null;
    finalizingRecordingRef.current = false;
    if (currentRecording) {
      currentRecording.setOnRecordingStatusUpdate(null);
      await currentRecording.stopAndUnloadAsync().catch(() => undefined);
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
          <Pressable style={styles.primaryButton} onPress={signIn} disabled={busy || !authReady}>
            {busy || !authReady ? <ActivityIndicator /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
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
            <Text style={styles.coreText}>
              {recording ? "OUVINDO" : speaking ? "FALANDO" : busy ? "PENSANDO" : voiceLoop ? "CONVERSA" : "SAMUEL"}
            </Text>
          </View>
        </View>

        <Text style={styles.capabilityText}>
          Núcleo compartilhado · {connectedCapabilities} capacidades conectadas · Desktop {bootstrap?.interaction.desktopControl ? "ativo" : "indisponível"} · Voz {voiceLoop ? "contínua" : "pronta"}
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
            style={[styles.micButton, (recording || voiceLoop) && styles.micButtonActive]}
            onPress={toggleRecording}
            disabled={busy && !speaking}
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
