"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  Mic,
  MicOff,
  Music2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Search,
  Send,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

import type { SamuelConversationChannel } from "@/apps/web/src/core/orchestrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import { loadSamuelChatHistory } from "../chat/samuel-chat.client";
import {
  isDesktopExecutionRequest,
  runSamuelDesktopCommand,
} from "../desktop/samuel-desktop-command.client";
import {
  SamuelHologram,
  type SamuelHologramState,
} from "./samuel-hologram";
import {
  isSamuelConfirmationPhrase,
  useSamuelConversationVoice,
} from "../voice/use-samuel-conversation-voice";
import { useSamuelSpeech } from "../voice/use-samuel-speech";
import {
  DEFAULT_SAMUEL_VOICE_PRESET,
  SAMUEL_VOICE_PRESETS,
  findSamuelVoicePreset,
} from "../voice/samuel-voice-presets";
import { useSamuelIdlePresence } from "../voice/use-samuel-idle-presence";
import { useSamuelMusicPlayer } from "../music/use-samuel-music-player";
import type {
  SamuelChatSendOptions,
  SamuelChatSendResult,
  SamuelToolActionPlan,
  SamuelToolResult,
  SamuelWebSource,
  SamuelSurfaceHandoff,
} from "../chat/samuel-chat.types";
import type { ChatMessage } from "../types";
import type {
  SamuelMission,
  SamuelMissionStep,
} from "../agent/samuel-mission";

type ChatPanelProps = {
  initialMessages: ChatMessage[];
  companyId: string;
  isProcessing?: boolean;
  onSendMessage?: (
    content: string,
    options: SamuelChatSendOptions,
  ) => Promise<SamuelChatSendResult>;
  onFirstMessage?: () => void;
};

type LocalHistory = {
  conversationId: string | null;
  messages: ChatMessage[];
};

type ContinuousVoiceState = {
  phase: "idle" | "connecting" | "listening" | "processing" | "speaking" | "error";
  active: boolean;
  error: string | null;
};

function actionSurfaceLabel(action: SamuelToolActionPlan | null | undefined) {
  return action?.surface === "calendar" ? "Google Agenda" : "Gmail";
}

function actionSurfaceEndpoint(action: SamuelToolActionPlan) {
  return action.surface === "calendar"
    ? "/api/samuel-ai/calendar/actions"
    : "/api/samuel-ai/gmail/actions";
}

function resultSurfaceLabel(result: SamuelToolResult | null | undefined) {
  return result && "surface" in result && result.surface === "calendar"
    ? "Google Agenda"
    : "Gmail";
}

type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type BrowserSpeechRecognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor():
  | BrowserSpeechRecognitionConstructor
  | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function createMessageId(role: ChatMessage["role"]) {
  return `${role}-${crypto.randomUUID()}`;
}

function storageKey(companyId: string) {
  return `sf-growth-ai:samuel-chat:${companyId}`;
}

function voiceStorageKey(companyId: string) {
  return `sf-growth-ai:samuel-voice:${companyId}`;
}

function readLocalHistory(companyId: string): LocalHistory | null {
  try {
    const value = localStorage.getItem(storageKey(companyId));
    if (!value) return null;
    const parsed = JSON.parse(value) as LocalHistory;
    if (!Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function SpokenMessageText({
  content,
  wordIndex,
}: {
  content: string;
  wordIndex: number;
}) {
  let currentWord = -1;

  return content.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part)) return part;
    currentWord += 1;
    return (
      <span
        key={`${index}-${part}`}
        className={cn(
          "samuel-message__spoken-word",
          currentWord < wordIndex && "is-complete",
          currentWord === wordIndex && "is-active",
        )}
      >
        {part}
      </span>
    );
  });
}

function ExecutiveMessage({
  message,
  speaking = false,
  spokenWordIndex = -1,
}: {
  message: ChatMessage;
  speaking?: boolean;
  spokenWordIndex?: number;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="samuel-message-row samuel-message-row--user">
        <div className="samuel-message samuel-message--user">
          <p className="samuel-message__author">
            Você
          </p>
          <p className="samuel-message__content">
            {message.content}
          </p>
        </div>
        <span className="samuel-message__time">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className="samuel-message-row samuel-message-row--assistant">
      <div
        className={cn(
          "samuel-message samuel-message--assistant",
          message.status === "streaming" && "samuel-message--streaming",
          speaking && "samuel-message--speaking",
          message.status === "error" && "samuel-message--error",
        )}
      >
        <div className="samuel-message__header">
          <div className="samuel-message__avatar">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <p className="samuel-message__name">Samuel AI™</p>
            <p className="samuel-message__status">
              {speaking
                ? "Samuel está falando"
                : message.status === "streaming"
                ? "A construir sua resposta…"
                : message.status === "cancelled"
                  ? "Resposta cancelada"
                  : message.status === "error"
                    ? "Falha na resposta"
                    : "Inteligência executiva"}
            </p>
          </div>
          {message.status === "streaming" && (
            <span className="samuel-message__thinking" aria-label="Samuel está respondendo" />
          )}
        </div>
        <div className={cn("samuel-message__content", message.status === "streaming" && "samuel-message__content--typing")}>
          {message.content ? (
            speaking ? (
              <SpokenMessageText content={message.content} wordIndex={spokenWordIndex} />
            ) : (
              message.content
            )
          ) : (
            "A preparar a resposta com o contexto disponível…"
          )}
        </div>
      </div>
      <span className="samuel-message__time">{formatTime(message.timestamp)}</span>
    </div>
  );
}


function missionStatusLabel(status: SamuelMission["status"]) {
  if (status === "waiting_approval") return "Aguardando aprovação";
  if (status === "completed") return "Concluída";
  if (status === "partial") return "Parcial";
  if (status === "blocked") return "Bloqueada";
  if (status === "planning") return "Planeando";
  return "Em execução";
}

function MissionStepIcon({ step }: { step: SamuelMissionStep }) {
  if (step.status === "completed") {
    return <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-300" />;
  }
  if (step.status === "running") {
    return <Loader2 aria-hidden="true" className="size-4 animate-spin text-cyan-300" />;
  }
  if (step.status === "waiting_approval") {
    return <AlertTriangle aria-hidden="true" className="size-4 text-amber-300" />;
  }
  if (step.status === "blocked") {
    return <AlertTriangle aria-hidden="true" className="size-4 text-rose-300" />;
  }
  if (step.status === "delegated") {
    return <Radio aria-hidden="true" className="size-4 text-violet-300" />;
  }
  return <Circle aria-hidden="true" className="size-4 text-white/25" />;
}

function SamuelMissionCard({ mission }: { mission: SamuelMission }) {
  const completed = mission.steps.filter((step) => step.status === "completed").length;
  const total = mission.steps.length;

  return (
    <div className="samuel-mission-card rounded-2xl border border-cyan-300/20 bg-cyan-300/[.045] px-3.5 py-3 text-xs text-[#d9efff]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-cyan-300/75">
            Missão Samuel
          </span>
          <p className="mt-1 line-clamp-2 font-semibold leading-snug text-white">
            {mission.objective}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-cyan-300/15 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.08em] text-cyan-100/80">
          {missionStatusLabel(mission.status)}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {mission.steps.map((step) => (
          <div
            key={step.id}
            className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-white/[.05] bg-black/15 px-2.5 py-2"
          >
            <span className="mt-0.5">
              <MissionStepIcon step={step} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-white/90">{step.title}</p>
              {step.evidence ? (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-white/45">
                  {step.evidence}
                </p>
              ) : null}
            </div>
            {step.requiresApproval && step.status !== "completed" ? (
              <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[.08em] text-amber-200/65">
                aprovação
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[9px] text-white/35">
        <span>{completed}/{total} etapas concluídas</span>
        <span>execução verificável</span>
      </div>
    </div>
  );
}

export function ChatPanel({
  initialMessages,
  companyId,
  isProcessing = false,
  onSendMessage,
  onFirstMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState(false);
  const [pendingAction, setPendingAction] = useState<SamuelToolActionPlan | null>(null);
  const [actionResult, setActionResult] = useState<SamuelToolResult | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceAutoSend, setVoiceAutoSend] = useState(true);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [voiceConsoleOpen, setVoiceConsoleOpen] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(
    DEFAULT_SAMUEL_VOICE_PRESET.id,
  );
  const [webSources, setWebSources] = useState<SamuelWebSource[]>([]);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const [userSpeechActive, setUserSpeechActive] = useState(false);
  const [continuousVoice, setContinuousVoice] = useState<ContinuousVoiceState>({
    phase: "idle",
    active: false,
    error: null,
  });
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [mission, setMission] = useState<SamuelMission | null>(null);
  const presenceSleeping = useSamuelIdlePresence();
  const [activeBrowserMessageId, setActiveBrowserMessageId] = useState<string | null>(null);
  const selectedVoice = findSamuelVoicePreset(selectedVoiceId);
  const {
    track: musicTrack,
    playing: musicPlaying,
    volume: musicVolume,
    queueIndex: musicQueueIndex,
    queueLength: musicQueueLength,
    error: musicError,
    limitation: musicLimitation,
    provider: musicProvider,
    spotifyConfigured,
    spotifyConnected,
    spotifyDisplayName,
    spotifyPremium,
    connectUrl: spotifyConnectUrl,
    execute: executeMusic,
    unlock: unlockMusic,
    setDucked: setMusicDucked,
  } = useSamuelMusicPlayer(companyId);
  const {
    blocked: browserSpeechBlocked,
    cancel: cancelBrowserSpeech,
    errorMessage: browserSpeechError,
    loadProgress: browserVoiceLoadProgress,
    mouthLevel: browserMouthLevel,
    progress: browserSpeechProgress,
    settling: browserSpeechSettling,
    speak: speakBrowserSpeech,
    speaking: browserSpeaking,
    status: browserSpeechStatus,
    supported: browserSpeechSupported,
    voiceLabel: browserVoiceLabel,
    wordIndex: browserSpeechWordIndex,
  } = useSamuelSpeech({
    enabled: voiceReplyEnabled,
    companyId,
    elevenLabsVoiceId: selectedVoice.id,
    elevenLabsVoiceName: selectedVoice.name,
  });

  useEffect(() => {
    setMusicDucked(browserSpeaking || userSpeechActive);
  }, [browserSpeaking, setMusicDucked, userSpeechActive]);
  const abortRef = useRef<AbortController | null>(null);
  const pendingHandoffRef = useRef<SamuelSurfaceHandoff | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const spokenAssistantRef = useRef<string | null>(null);
  const hasEngaged = messages.length > 0;
  const busy = sending || isProcessing;

  useEffect(() => {
    let nextVoiceId = DEFAULT_SAMUEL_VOICE_PRESET.id;
    try {
      const saved = localStorage.getItem(voiceStorageKey(companyId));
      if (saved && SAMUEL_VOICE_PRESETS.some((voice) => voice.id === saved)) {
        nextVoiceId = saved;
      }
    } catch {
      // Keep the default voice when local storage is unavailable.
    }
    const timer = window.setTimeout(() => setSelectedVoiceId(nextVoiceId), 0);
    return () => window.clearTimeout(timer);
  }, [companyId]);

  useEffect(() => {
    const controller = new AbortController();
    const local = readLocalHistory(companyId);

    void loadSamuelChatHistory(companyId, controller.signal)
      .then((history) => {
        const hasRemoteHistory = history.messages.length > 0 || history.conversationId;
        setMessages(hasRemoteHistory ? history.messages : local?.messages ?? initialMessages);
        setConversationId(
          hasRemoteHistory ? history.conversationId : local?.conversationId ?? null,
        );
      })
      .catch((historyError: unknown) => {
        if (!controller.signal.aborted) {
          setMessages(local?.messages ?? initialMessages);
          setConversationId(local?.conversationId ?? null);
          setWarning(
            historyError instanceof Error
              ? `Histórico remoto indisponível: ${historyError.message}`
              : "Histórico remoto indisponível; a conversa continuará neste dispositivo.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHydrated(true);
      });

    return () => controller.abort();
  }, [companyId, initialMessages]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        storageKey(companyId),
        JSON.stringify({ conversationId, messages } satisfies LocalHistory),
      );
    } catch {
      // Private browsing or storage quotas may disable the local fallback.
    }
  }, [companyId, conversationId, hydrated, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      recognitionRef.current?.abort();
      cancelBrowserSpeech();
    },
    [cancelBrowserSpeech],
  );

  const speakSamuel = useCallback((content: string, messageId: string, force = false) => {
    if (!voiceReplyEnabled) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!force && spokenAssistantRef.current === trimmed) return;

    spokenAssistantRef.current = trimmed;
    setActiveBrowserMessageId(messageId);
    const launched = speakBrowserSpeech(trimmed, {
      onEnd: () => setActiveBrowserMessageId((current) => current === messageId ? null : current),
      onError: () => setActiveBrowserMessageId((current) => current === messageId ? null : current),
    });
    if (!launched) setActiveBrowserMessageId(null);
  }, [speakBrowserSpeech, voiceReplyEnabled]);

  const samuelSpeaking = browserSpeaking || continuousVoice.phase === "speaking";
  const activeSpokenMessageId = browserSpeaking ? activeBrowserMessageId : null;
  const activeSpokenWordIndex = browserSpeaking ? browserSpeechWordIndex : -1;
  const hologramAudioLevel = browserSpeaking ? browserMouthLevel : 0;
  const hologramSpeechProgress = browserSpeaking ? browserSpeechProgress : 0;
  const hologramState: SamuelHologramState = samuelSpeaking
    ? "speaking"
    : continuousVoice.phase === "error"
      ? "error"
      : browserSpeechSettling || listening || continuousVoice.phase === "listening"
        ? "listening"
        : busy || continuousVoice.phase === "processing"
          ? "processing"
          : continuousVoice.phase === "connecting"
            ? "executing"
            : presenceSleeping
              ? "sleeping"
              : "resting";
  const lastAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" &&
            message.status !== "streaming" &&
            message.content.trim(),
        ) ?? null,
    [messages],
  );
  const visibleMessages = useMemo(
    () => (historyExpanded ? messages : messages.slice(-12)),
    [historyExpanded, messages],
  );
  const hiddenMessageCount = Math.max(0, messages.length - visibleMessages.length);
  const liveCaption = useMemo(() => {
    const activeMessage = messages.find((message) => message.id === activeSpokenMessageId);
    const source =
      activeMessage?.content ||
      lastAssistantMessage?.content ||
      "Fale por voz ou escreva uma instrução. O holograma é o Samuel AI em modo executivo.";
    return source.length > 210 ? `${source.slice(0, 210).trim()}…` : source;
  }, [activeSpokenMessageId, lastAssistantMessage?.content, messages]);

  const performSend = useCallback(
    async (
      rawContent: string,
      retry = false,
      channel: SamuelConversationChannel = "web",
    ) => {
      const trimmed = rawContent.trim();
      if (!trimmed || busy || !onSendMessage) return;

      if (!hasEngaged) onFirstMessage?.();

      const withoutFailedAssistant = retry
        ? messages.filter((message) => message.status !== "error")
        : messages;
      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: "complete",
      };
      const assistantId = createMessageId("assistant");
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "streaming",
      };
      const nextMessages = retry
        ? [...withoutFailedAssistant, assistantMessage]
        : [...withoutFailedAssistant, userMessage, assistantMessage];
      let history = withoutFailedAssistant.filter(
        (message) => !message.status || message.status === "complete",
      );
      if (
        retry &&
        history.at(-1)?.role === "user" &&
        history.at(-1)?.content === trimmed
      ) {
        history = history.slice(0, -1);
      }

      setMessages(nextMessages);
      setInput("");
      setSending(true);
      setError(null);
      setWarning(null);
      setWebSources([]);
      setMusicNotice(null);
      setProviderLabel(null);
      setLastFailedQuery(null);
      setPendingAction(null);
      setActionResult(null);
      setHistoryExpanded(false);
      setMission(null);
      pendingHandoffRef.current = null;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (isDesktopExecutionRequest(trimmed)) {
          const desktopResult = await runSamuelDesktopCommand({
            companyId,
            goal: trimmed,
            signal: controller.signal,
          });
          const completedMessage: ChatMessage = {
            ...assistantMessage,
            content: desktopResult,
            status: "complete",
          };
          setMessages((current) => current.map((message) =>
            message.id === assistantId ? completedMessage : message,
          ));
          speakSamuel(desktopResult, assistantId);
          return;
        }

        const result = await onSendMessage(trimmed, {
          conversationId,
          history,
          signal: controller.signal,
          channel,
          onEvent(event) {
            if (event.type === "start") setConversationId(event.conversationId);
            if (event.type === "warning") setWarning(event.message);
            if (event.type === "mission_plan" || event.type === "mission_update") {
              setMission(event.mission);
            }
            if (event.type === "web_sources") setWebSources(event.sources);
            if (event.type === "music_action") {
              void executeMusic(event.command)
                .then((message) => setMusicNotice(message))
                .catch((musicFailure: unknown) => {
                  setMusicNotice(
                    musicFailure instanceof Error
                      ? musicFailure.message
                      : "Não foi possível controlar a música.",
                  );
                });
            }
            if (event.type === "provider") {
              setProviderLabel(
                event.model ? `${event.provider} · ${event.model}` : event.provider,
              );
            }
            if (event.type === "action_proposal") {
              setPendingAction(event.action);
            }
            if (event.type === "action_result") {
              setActionResult(event.result);
            }
            if (event.type === "content_project") {
              try {
                sessionStorage.setItem("sf-growth-ai:samuel-content:incoming", JSON.stringify(event.project));
              } catch {
                // The project can still be recreated manually if browser storage is blocked.
              }
              window.dispatchEvent(new CustomEvent("samuel-open-content-studio"));
            }
            if (event.type === "delta") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.delta }
                    : message,
                ),
              );
            }
            if (event.type === "complete") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId ? event.message : message,
                ),
              );
              setConversationId(event.conversationId);
              if (event.pendingAction) setPendingAction(event.pendingAction);
              pendingHandoffRef.current = event.handoff ?? null;
              speakSamuel(event.message.content, event.message.id);
            }
          },
        });

        setConversationId(result.conversationId);
        setProviderLabel(
          result.model ? `${result.provider} · ${result.model}` : result.provider,
        );
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: result.content, status: "complete" }
              : message,
          ),
        );
        speakSamuel(result.content, assistantId);

        const handoff = pendingHandoffRef.current;
        pendingHandoffRef.current = null;
        if (handoff?.surface === "site-builder") {
          try {
            sessionStorage.setItem(
              "sf-growth-ai:samuel-site-builder:incoming",
              JSON.stringify(handoff.payload),
            );
          } catch {
            // The builder can still open with company defaults if storage is restricted.
          }
          window.dispatchEvent(new CustomEvent("samuel-open-site-builder"));
        }
      } catch (sendError) {
        const cancelled =
          controller.signal.aborted ||
          (sendError instanceof DOMException && sendError.name === "AbortError");
        if (cancelled) {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content || "Resposta cancelada.",
                    status: "cancelled",
                  }
                : message,
            ),
          );
        } else {
          const message =
            sendError instanceof Error
              ? sendError.message
              : "Não foi possível concluir a resposta.";
          setError(message);
          setLastFailedQuery(trimmed);
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantId
                ? {
                    ...item,
                    content: item.content || message,
                    status: "error",
                  }
                : item,
            ),
          );
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setSending(false);
      }
    },
    [
      busy,
      conversationId,
      hasEngaged,
      messages,
      onFirstMessage,
      onSendMessage,
      speakSamuel,
      executeMusic,
    ],
  );

  const interruptSamuel = useCallback(() => {
    cancelBrowserSpeech();
    abortRef.current?.abort();
  }, [cancelBrowserSpeech]);

  const conversationVoice = useSamuelConversationVoice({
    companyId,
    assistantSpeaking: browserSpeaking,
    assistantText: lastAssistantMessage?.content ?? "",
    onInterrupt: interruptSamuel,
    onSpeechActivity: setUserSpeechActive,
    onTranscript: async ({ text }) => {
      if (pendingAction && isSamuelConfirmationPhrase(text)) {
        await confirmPendingAction();
        return;
      }
      await performSend(text, false, "voice");
    },
  });

  useEffect(() => {
    const phase: ContinuousVoiceState["phase"] = browserSpeaking
      ? "speaking"
      : conversationVoice.phase;
    const detail: ContinuousVoiceState = {
      phase,
      active: conversationVoice.active,
      error: conversationVoice.error,
    };
    window.dispatchEvent(new CustomEvent("samuel:voice-state", { detail }));
    const timer = window.setTimeout(() => setContinuousVoice(detail), 0);
    return () => window.clearTimeout(timer);
  }, [
    browserSpeaking,
    conversationVoice.active,
    conversationVoice.error,
    conversationVoice.phase,
  ]);

  useEffect(() => {
    const toggle = () => {
      unlockMusic();
      void conversationVoice.toggle();
    };
    const stop = () => {
      conversationVoice.stop();
      interruptSamuel();
    };
    const submit = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      const message = detail?.message?.trim();
      if (message) void performSend(message);
    };
    const cancel = () => interruptSamuel();

    window.addEventListener("samuel:voice-toggle", toggle);
    window.addEventListener("samuel:voice-stop", stop);
    window.addEventListener("samuel:chat-submit", submit as EventListener);
    window.addEventListener("samuel:chat-cancel", cancel);
    return () => {
      window.removeEventListener("samuel:voice-toggle", toggle);
      window.removeEventListener("samuel:voice-stop", stop);
      window.removeEventListener("samuel:chat-submit", submit as EventListener);
      window.removeEventListener("samuel:chat-cancel", cancel);
    };
  }, [
    conversationVoice.stop,
    conversationVoice.toggle,
    interruptSamuel,
    performSend,
    unlockMusic,
  ]);


  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startVoiceInput = useCallback(() => {
    if (busy || !hydrated) return;
    unlockMusic();
    if (conversationVoice.active) conversationVoice.stop();

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setVoiceNotice(
        "Este navegador ainda não suporta captura de voz. Use Chrome, Edge ou Safari atualizado.",
      );
      return;
    }

    recognitionRef.current?.abort();
    cancelBrowserSpeech();

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? "";
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const nextInput = `${finalTranscript}${interimTranscript}`.trimStart();
      setInput(nextInput);
      setVoiceNotice(interimTranscript ? "Samuel está ouvindo…" : null);
    };

    recognition.onerror = () => {
      setVoiceNotice("Não consegui captar o áudio. Verifique a permissão do microfone.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;

      const transcript = finalTranscript.trim();
      if (voiceAutoSend && transcript) {
        void performSend(transcript, false, "voice");
      } else if (transcript) {
        setVoiceNotice("Mensagem de voz transcrita. Revise e envie quando quiser.");
      }
    };

    recognitionRef.current = recognition;
    setListening(true);
    setVoiceNotice("Samuel está ouvindo… fale naturalmente.");
    recognition.start();
  }, [
    busy,
    cancelBrowserSpeech,
    conversationVoice.active,
    conversationVoice.stop,
    hydrated,
    performSend,
    unlockMusic,
    voiceAutoSend,
  ]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void performSend(input);
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction?.confirmationToken || confirmingAction) return;
    const target = actionSurfaceLabel(pendingAction);
    setConfirmingAction(true);
    setError(null);
    try {
      const response = await fetch(actionSurfaceEndpoint(pendingAction), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          actionId: pendingAction.actionId,
          args: pendingAction.args,
          confirmationToken: pendingAction.confirmationToken,
          confirm: true,
        }),
      });
      const payload = (await response.json()) as SamuelToolResult & { error?: string };
      if (!response.ok && !payload.summary) {
        throw new Error(payload.error || `Falha ao confirmar ação no ${target}.`);
      }
      setActionResult(payload);
      setPendingAction(null);
      const actionMessage: ChatMessage = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${pendingAction.surface}-${Date.now()}`,
        role: "assistant",
        content: payload.ok
          ? `✅ Ação executada no ${target}.\n\n${payload.summary}`
          : `❌ Não consegui executar no ${target}.\n\n${payload.summary || payload.error}`,
        timestamp: new Date().toISOString(),
        status: "complete",
      };
      setMessages((current) => [...current, actionMessage]);
      speakSamuel(actionMessage.content, actionMessage.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Falha ao confirmar ação no ${target}.`);
    } finally {
      setConfirmingAction(false);
    }
  }

  return (
    <div className="samuel-chat-shell samuel-chat-shell--hologram">
      <div className={cn("samuel-chat-presence", samuelSpeaking && "samuel-chat-presence--speaking")}>
        <SamuelHologram
          state={hologramState}
          audioLevel={hologramAudioLevel}
          speechProgress={hologramSpeechProgress}
          smiling={browserSpeechSettling}
        />
        <div className="samuel-chat-presence__copy">
          <span>Samuel AI · presença executiva</span>
          <strong>
            {samuelSpeaking
              ? "Estou falando com você"
              : browserSpeechSettling || continuousVoice.phase === "listening"
                ? "Estou ouvindo"
                : busy
                  ? "Estou analisando"
                  : "Estou online e atento"}
          </strong>
          <p>
            O holograma é o Samuel. A voz, a boca, os olhos e a mensagem ativa trabalham juntos.
          </p>
          <blockquote className="samuel-chat-presence__caption">
            {liveCaption}
          </blockquote>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversa com Samuel AI"
        className="samuel-chat-log"
      >
        <div className="samuel-chat-history-header">
          <div>
            <span>Histórico compacto</span>
            <strong>Conversa com Samuel</strong>
          </div>
          <button
            type="button"
            onClick={() => setHistoryExpanded((current) => !current)}
            disabled={messages.length <= 12}
          >
            {historyExpanded ? "Compactar" : `Ver tudo${hiddenMessageCount ? ` (+${hiddenMessageCount})` : ""}`}
          </button>
        </div>

        {mission ? <SamuelMissionCard mission={mission} /> : null}

        {!hasEngaged && (
          <div className="samuel-chat-empty">
            <div className="samuel-chat-empty__icon">
              <Sparkles aria-hidden="true" />
            </div>
            <strong>Samuel está pronto para começar</strong>
            <p>
              Escreva sua mensagem ou use o microfone. As respostas podem ser
              reproduzidas com a voz masculina do Samuel pela ElevenLabs.
            </p>
          </div>
        )}

        {hiddenMessageCount > 0 && !historyExpanded && (
          <button
            type="button"
            className="samuel-chat-history-hint"
            onClick={() => setHistoryExpanded(true)}
          >
            {hiddenMessageCount} mensagem(ns) anterior(es) ocultas para manter a tela leve. Tocar para expandir.
          </button>
        )}

        {visibleMessages.map((message) => {
          const speakingMessage = message.id === activeSpokenMessageId;
          return (
            <ExecutiveMessage
              key={message.id}
              message={message}
              speaking={speakingMessage}
              spokenWordIndex={speakingMessage ? activeSpokenWordIndex : -1}
            />
          );
        })}

        {webSources.length > 0 && (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.05] px-4 py-3 text-xs text-[#cfeaff]">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Search aria-hidden="true" className="size-4 text-cyan-300" />
              Fontes consultadas em tempo real
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {webSources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-full truncate rounded-lg border border-cyan-300/15 bg-black/20 px-2.5 py-1.5 text-[11px] text-cyan-100 underline-offset-2 hover:underline"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {(musicTrack || musicNotice || musicError) && (
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[.05] px-4 py-3 text-xs text-[#f7e9ff]">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/20 bg-[#10081a] bg-cover bg-center shadow-[0_0_20px_rgba(217,70,239,.12)]"
                style={
                  musicTrack?.artworkUrl
                    ? { backgroundImage: `url("${musicTrack.artworkUrl}")` }
                    : undefined
                }
              >
                {!musicTrack?.artworkUrl && <Music2 className="size-5 text-fuchsia-200" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Music2 aria-hidden="true" className="size-4 text-fuchsia-300" />
                  Música por voz{musicProvider === "spotify" ? " · Spotify" : ""}
                </div>
                {musicTrack ? (
                  <>
                    <p className="mt-1 truncate font-medium text-white">
                      {musicTrack.title}
                    </p>
                    <p className="truncate text-[11px] text-fuchsia-100/70">
                      {musicTrack.artist}
                      {musicQueueLength > 1
                        ? ` · ${musicQueueIndex + 1}/${musicQueueLength}`
                        : ""}
                    </p>
                  </>
                ) : null}
                {(musicError || musicNotice) && (
                  <p className={cn("mt-1 text-[11px]", musicError ? "text-rose-200" : "text-fuchsia-100/75")}>
                    {musicError || musicNotice}
                  </p>
                )}
              </div>
            </div>
            {musicTrack && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void executeMusic({ action: "previous" }).then(setMusicNotice).catch((error) => setMusicNotice(error instanceof Error ? error.message : "Falha ao voltar a faixa."))}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white"
                  aria-label="Faixa anterior"
                >
                  <SkipBack className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void executeMusic({ action: musicPlaying ? "pause" : "resume" }).then(setMusicNotice).catch((error) => setMusicNotice(error instanceof Error ? error.message : "Falha ao controlar a música."))}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 text-white"
                  aria-label={musicPlaying ? "Pausar música" : "Continuar música"}
                >
                  {musicPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => void executeMusic({ action: "next" }).then(setMusicNotice).catch((error) => setMusicNotice(error instanceof Error ? error.message : "Falha ao avançar a faixa."))}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white"
                  aria-label="Próxima faixa"
                >
                  <SkipForward className="size-4" />
                </button>
                <span className="ml-1 text-[10px] text-white/45">
                  Volume {musicVolume}% · {musicProvider === "spotify" ? "Spotify Connect" : "prévia integrada"}
                </span>
              </div>
            )}
            {musicLimitation && musicTrack && (
              <p className="mt-2 text-[10px] leading-relaxed text-white/35">
                {musicLimitation}
              </p>
            )}
          </div>
        )}

        {warning && (
          <div className="samuel-chat-notice samuel-chat-notice--warning">
            {warning}
          </div>
        )}

        {(voiceNotice || browserSpeechBlocked || browserSpeechError) && (
          <div className="samuel-chat-notice samuel-chat-notice--voice">
            {voiceNotice ||
              browserSpeechError ||
              "O navegador bloqueou a reprodução automática. Use “Ouvir última resposta” para liberar a voz."}
          </div>
        )}

        {error && (
          <div className="samuel-chat-notice samuel-chat-notice--error">
            <p>{error}</p>
            {lastFailedQuery && (
              <Button
                type="button"
                variant="secondary"
                className="h-8 shrink-0 border-red-200 bg-white px-3 text-xs text-red-700"
                onClick={() => void performSend(lastFailedQuery, true)}
                disabled={busy}
              >
                Tentar novamente
              </Button>
            )}
          </div>
        )}

        {pendingAction ? (
          <div className="rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Confirmação {actionSurfaceLabel(pendingAction)}
            </p>
            <p className="mt-1 font-semibold">{pendingAction.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
              {pendingAction.preview}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-9 px-3 text-xs"
                disabled={confirmingAction || busy}
                onClick={() => void confirmPendingAction()}
              >
                {confirmingAction ? "A executar…" : "Confirmar e executar"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3 text-xs"
                disabled={confirmingAction}
                onClick={() => setPendingAction(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}

        {actionResult && !pendingAction ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs",
              actionResult.ok
                ? "border-emerald-300/50 bg-emerald-50 text-emerald-950"
                : "border-rose-300/50 bg-rose-50 text-rose-950",
            )}
          >
            <p className="font-semibold">
              {actionResult.ok
                ? `${resultSurfaceLabel(actionResult)} atualizado`
                : `Falha no ${resultSurfaceLabel(actionResult)}`}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{actionResult.summary}</p>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="samuel-chat-composer">
        <div className="samuel-chat-composer__heading">
          <div>
            <span>Canal executivo seguro</span>
            <strong>Converse com Samuel</strong>
          </div>
          {providerLabel && (
            <p>{providerLabel}</p>
          )}
        </div>

        <div
          className={cn(
            "samuel-voice-console",
            (continuousVoice.active || browserSpeaking || browserSpeechStatus === "preparing") && "samuel-voice-console--active",
            samuelSpeaking && "samuel-voice-console--speaking",
            continuousVoice.phase === "error" && "samuel-voice-console--error",
          )}
        >
          <div className="samuel-voice-console__topline">
            <div className="samuel-voice-console__identity">
              <span><Radio aria-hidden="true" /></span>
              <div>
                <p>Samuel Voice · {selectedVoice.gender}</p>
                <strong>
                  {browserSpeechStatus === "preparing"
                    ? `Preparando ${browserVoiceLabel ?? "voz neural"} · ${Math.round(browserVoiceLoadProgress * 100)}%`
                    : browserSpeaking
                      ? `${browserVoiceLabel ?? "Samuel Neural"} · falando`
                      : continuousVoice.phase === "connecting"
                        ? "Abrindo o microfone"
                        : continuousVoice.phase === "listening"
                          ? "Ouvindo continuamente"
                          : continuousVoice.phase === "processing"
                            ? "Entendendo sua fala"
                            : continuousVoice.phase === "speaking"
                              ? "Respondendo pela ElevenLabs"
                        : browserVoiceLabel
                          ? `${browserVoiceLabel} · pronta`
                          : `${selectedVoice.name} · ElevenLabs pronta`}
                </strong>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="samuel-voice-console__meter"
              title="Visualizador de áudio"
            >
              {[0.28, 0.5, 0.8, 0.44, 0.64].map((weight, index) => (
                <span
                  key={weight}
                  style={{
                    height: `${8 + Math.round((browserSpeaking ? browserMouthLevel : continuousVoice.active ? 0.65 : 0) * weight * 28)}px`,
                    opacity: continuousVoice.active || browserSpeaking ? 1 : 0.35 + index * 0.08,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="samuel-voice-console__primary-actions">
            <button
              type="button"
              onClick={() => {
                unlockMusic();
                if (listening) stopVoiceInput();
                void conversationVoice.toggle();
              }}
              disabled={!hydrated}
              className="samuel-reference-mic samuel-voice-console__start"
              aria-pressed={continuousVoice.active}
            >
              {continuousVoice.active ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {continuousVoice.active
                ? "Encerrar conversa"
                : continuousVoice.phase === "error"
                  ? "Tentar microfone novamente"
                  : "Conversar por voz"}
            </button>
            <button
              type="button"
              onClick={() => setVoiceConsoleOpen((current) => !current)}
              className="samuel-voice-console__settings"
              aria-expanded={voiceConsoleOpen}
            >
              <SlidersHorizontal aria-hidden="true" />
              {voiceConsoleOpen ? "Ocultar ajustes" : "Ajustes"}
            </button>
          </div>

          <div className="samuel-voice-console__services">
            <div className="samuel-voice-console__service">
              <Music2 aria-hidden="true" />
              <div>
                <strong>Spotify</strong>
                <span>
                  {!spotifyConfigured
                    ? "Integração ainda não configurada"
                    : spotifyConnected
                      ? `Conectado${spotifyDisplayName ? ` · ${spotifyDisplayName}` : ""}${spotifyPremium === false ? " · Premium necessário para reprodução" : ""}`
                      : "Conecte uma vez para controlar música por voz"}
                </span>
              </div>
              {spotifyConfigured && !spotifyConnected ? (
                <a href={spotifyConnectUrl}>Conectar</a>
              ) : spotifyConnected ? (
                <span className="samuel-voice-console__service-status">ativo</span>
              ) : null}
            </div>
          </div>

          <label className="samuel-voice-selector mt-3 block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.16em] text-[#87cfff]">
              Voz do Samuel
            </span>
            <select
              value={selectedVoice.id}
              onChange={(event) => {
                const next = findSamuelVoicePreset(event.target.value);
                setSelectedVoiceId(next.id);
                cancelBrowserSpeech();
                try {
                  localStorage.setItem(voiceStorageKey(companyId), next.id);
                } catch {
                  // Keep the in-memory choice if local storage is unavailable.
                }
              }}
              className="min-h-11 w-full rounded-xl border border-[#185d87] bg-[#061421] px-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              {SAMUEL_VOICE_PRESETS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} — {voice.description}
                </option>
              ))}
            </select>
          </label>

          {continuousVoice.phase === "error" && continuousVoice.error && (
            <div className="samuel-voice-console__error" role="alert">
              <AlertTriangle aria-hidden="true" />
              <div>
                <strong>Não foi possível abrir o microfone</strong>
                <p>{continuousVoice.error}</p>
                <span>Confirme a permissão de microfone do Safari e tente novamente.</span>
              </div>
            </div>
          )}

          {(voiceConsoleOpen || continuousVoice.active) && (
            <div className="samuel-voice-console__details">
              <div className="samuel-voice-console__controls">
                <button
                  type="button"
                  onClick={interruptSamuel}
                  disabled={!browserSpeaking && !busy}
                >
                  <VolumeX aria-hidden="true" /> Interromper Samuel
                </button>
              </div>
              <p>O microfone permanece ativo e cada fala entra na mesma sessão, memória, skills e ferramentas usadas pelo texto.</p>
            </div>
          )}
        </div>

        <div className="samuel-chat-voice-options">
          <button
            type="button"
            onClick={() => setVoiceAutoSend((current) => !current)}
            className={cn(
              "samuel-chat-voice-option",
              voiceAutoSend && "samuel-chat-voice-option--active",
            )}
          >
            <Mic aria-hidden="true" /> Ditado envia sozinho
          </button>
          <button
            type="button"
            onClick={() => {
              setVoiceReplyEnabled((current) => !current);
              cancelBrowserSpeech();
            }}
            className={cn(
              "samuel-chat-voice-option",
              voiceReplyEnabled && "samuel-chat-voice-option--active",
            )}
          >
            {voiceReplyEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            Voz {selectedVoice.gender} {voiceReplyEnabled ? "ativa" : "desativada"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (lastAssistantMessage) {
                speakSamuel(lastAssistantMessage.content, lastAssistantMessage.id, true);
              }
            }}
            disabled={!lastAssistantMessage || !browserSpeechSupported}
            className="samuel-chat-voice-option"
          >
            <RotateCcw aria-hidden="true" /> Ouvir resposta
          </button>
        </div>

        <div className="samuel-chat-input-grid">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem para o Samuel AI…"
            aria-label="Mensagem para o Samuel AI"
            disabled={busy || !hydrated}
            rows={2}
            className="samuel-chat-textarea"
          />
          <div className="samuel-chat-input-actions">
            <button
              type="button"
              onClick={listening ? stopVoiceInput : startVoiceInput}
              disabled={!hydrated || busy}
              className={cn("samuel-chat-dictation", listening && "is-listening")}
            >
              {listening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {listening ? "Parar" : "Ditado"}
            </button>
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="samuel-chat-send is-cancel"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void performSend(input)}
                disabled={!hydrated || !input.trim() || !onSendMessage}
                className="samuel-chat-send"
              >
                <Send aria-hidden="true" /> Enviar
              </button>
            )}
          </div>
        </div>
        <p className="samuel-chat-composer__helper">
          Enter envia · Shift+Enter cria uma nova linha · Samuel pode ler a resposta em voz alta
        </p>
      </div>
    </div>
  );
}
