"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  SamuelMusicCommand,
  SamuelMusicSearchResponse,
  SamuelMusicTrack,
} from "./samuel-music.types";

type SamuelMusicPlayerState = {
  track: SamuelMusicTrack | null;
  playing: boolean;
  volume: number;
  queueIndex: number;
  queueLength: number;
  error: string | null;
  limitation: string | null;
};

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

function responseError(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }
  return fallback;
}

export function useSamuelMusicPlayer(companyId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<SamuelMusicTrack[]>([]);
  const indexRef = useRef(-1);
  const baseVolumeRef = useRef(0.72);
  const duckedRef = useRef(false);
  const [state, setState] = useState<SamuelMusicPlayerState>({
    track: null,
    playing: false,
    volume: 72,
    queueIndex: -1,
    queueLength: 0,
    error: null,
    limitation: null,
  });

  const effectiveVolume = useCallback(() => {
    return duckedRef.current
      ? Math.min(baseVolumeRef.current, Math.max(0.08, baseVolumeRef.current * 0.22))
      : baseVolumeRef.current;
  }, []);

  const syncVolume = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = effectiveVolume();
  }, [effectiveVolume]);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = effectiveVolume();
    audio.addEventListener("play", () => {
      setState((current) => ({ ...current, playing: true, error: null }));
    });
    audio.addEventListener("pause", () => {
      setState((current) => ({ ...current, playing: false }));
    });
    audio.addEventListener("error", () => {
      setState((current) => ({
        ...current,
        playing: false,
        error: "O navegador não conseguiu reproduzir esta faixa.",
      }));
    });
    audioRef.current = audio;
    return audio;
  }, [effectiveVolume]);

  const updateMediaSession = useCallback((track: SamuelMusicTrack | null) => {
    if (!("mediaSession" in navigator)) return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album ?? "",
      artwork: track.artworkUrl
        ? [{ src: track.artworkUrl, sizes: "300x300", type: "image/jpeg" }]
        : [],
    });
  }, []);

  const playIndex = useCallback(
    async (index: number) => {
      const queue = queueRef.current;
      if (!queue.length) throw new Error("A fila de música está vazia.");
      const normalized = ((index % queue.length) + queue.length) % queue.length;
      const track = queue[normalized];
      if (!track) throw new Error("Faixa indisponível.");

      const audio = ensureAudio();
      indexRef.current = normalized;
      audio.src = track.previewUrl;
      audio.currentTime = 0;
      syncVolume();
      setState((current) => ({
        ...current,
        track,
        queueIndex: normalized,
        queueLength: queue.length,
        error: null,
      }));
      updateMediaSession(track);
      await audio.play();
      return track;
    },
    [ensureAudio, syncVolume, updateMediaSession],
  );

  const next = useCallback(async () => {
    if (!queueRef.current.length) throw new Error("Não há próxima faixa na fila.");
    return playIndex(indexRef.current + 1);
  }, [playIndex]);

  const previous = useCallback(async () => {
    if (!queueRef.current.length) throw new Error("Não há faixa anterior na fila.");
    return playIndex(indexRef.current - 1);
  }, [playIndex]);

  useEffect(() => {
    const audio = ensureAudio();
    const handleEnded = () => {
      if (queueRef.current.length > 1) void next().catch(() => undefined);
    };
    audio.addEventListener("ended", handleEnded);

    if ("mediaSession" in navigator) {
      const safeHandler = (
        action: MediaSessionAction,
        handler: MediaSessionActionHandler | null,
      ) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          // Some browsers expose MediaSession with a reduced action set.
        }
      };
      safeHandler("play", () => void audio.play());
      safeHandler("pause", () => audio.pause());
      safeHandler("nexttrack", () => void next());
      safeHandler("previoustrack", () => void previous());
      safeHandler("stop", () => {
        audio.pause();
        audio.currentTime = 0;
      });
    }

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [ensureAudio, next, previous]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      if ("mediaSession" in navigator) navigator.mediaSession.metadata = null;
    },
    [],
  );

  const unlock = useCallback(() => {
    const audio = ensureAudio();
    if (audio.src || !audio.paused) return;
    const previousMuted = audio.muted;
    audio.muted = true;
    audio.src = SILENT_WAV;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
        audio.muted = previousMuted;
      })
      .catch(() => {
        audio.muted = previousMuted;
      });
  }, [ensureAudio]);

  const setDucked = useCallback(
    (ducked: boolean) => {
      duckedRef.current = ducked;
      syncVolume();
    },
    [syncVolume],
  );

  const execute = useCallback(
    async (command: SamuelMusicCommand) => {
      const audio = ensureAudio();
      setState((current) => ({ ...current, error: null }));

      try {
        if (command.action === "play") {
          const query = command.query?.trim();
          if (!query) throw new Error("Diga qual música ou artista deseja ouvir.");
          const response = await fetch(
            `/api/samuel-ai/music/search?companyId=${encodeURIComponent(companyId)}&q=${encodeURIComponent(query)}`,
            { cache: "no-store" },
          );
          const payload = (await response.json().catch(() => ({}))) as
            | SamuelMusicSearchResponse
            | { error?: string };
          if (!response.ok || !("tracks" in payload) || !payload.tracks.length) {
            throw new Error(
              responseError(payload, "Não encontrei uma faixa reproduzível."),
            );
          }

          queueRef.current = payload.tracks;
          indexRef.current = -1;
          setState((current) => ({
            ...current,
            queueLength: payload.tracks.length,
            limitation: payload.limitation,
          }));
          const track = await playIndex(0);
          return `Tocando ${track.title}, de ${track.artist}.`;
        }

        if (command.action === "pause") {
          audio.pause();
          return state.track ? `Pausado: ${state.track.title}.` : "Música pausada.";
        }

        if (command.action === "resume") {
          if (!audio.src) throw new Error("Ainda não há uma música carregada.");
          await audio.play();
          return state.track ? `Continuando ${state.track.title}.` : "Continuando a música.";
        }

        if (command.action === "stop") {
          audio.pause();
          audio.currentTime = 0;
          setState((current) => ({ ...current, playing: false }));
          return "Música encerrada.";
        }

        if (command.action === "next") {
          const track = await next();
          return `Próxima: ${track.title}, de ${track.artist}.`;
        }

        if (command.action === "previous") {
          const track = await previous();
          return `Voltando para ${track.title}, de ${track.artist}.`;
        }

        if (command.action === "set_volume") {
          const nextVolume = Math.max(0, Math.min(100, command.volume ?? 70));
          baseVolumeRef.current = nextVolume / 100;
          syncVolume();
          setState((current) => ({ ...current, volume: nextVolume }));
          return `Volume em ${nextVolume}%.`;
        }

        const delta = command.action === "volume_up" ? 0.1 : -0.1;
        baseVolumeRef.current = Math.max(
          0,
          Math.min(1, baseVolumeRef.current + delta),
        );
        syncVolume();
        const nextVolume = Math.round(baseVolumeRef.current * 100);
        setState((current) => ({ ...current, volume: nextVolume }));
        return `Volume em ${nextVolume}%.`;
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "O navegador bloqueou a reprodução automática. Toque uma vez no controle de música e tente novamente por voz."
            : error instanceof Error
              ? error.message
              : "Não foi possível controlar a música.";
        setState((current) => ({ ...current, error: message }));
        throw new Error(message);
      }
    },
    [companyId, ensureAudio, next, playIndex, previous, state.track, syncVolume],
  );

  return {
    ...state,
    execute,
    next,
    previous,
    unlock,
    setDucked,
  };
}
