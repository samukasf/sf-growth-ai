import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import type { SamuelMusicCommand, SamuelMusicTrack } from "./samuel-music.types";

const SPOTIFY_SESSION_COOKIE = "samuel_spotify_session";
const SPOTIFY_STATE_COOKIE = "samuel_spotify_oauth_state";
const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";

type SpotifySession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type SpotifyState = {
  state: string;
  companyId: string;
  returnTo: string;
};

type SpotifyDevice = {
  id: string | null;
  is_active?: boolean;
  name?: string;
  type?: string;
};

type SpotifyTrackItem = {
  id: string;
  name: string;
  uri: string;
  external_urls?: { spotify?: string };
  artists?: Array<{ name?: string }>;
  album?: {
    name?: string;
    images?: Array<{ url?: string }>;
  };
};

function spotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  return {
    configured: Boolean(clientId && clientSecret),
    clientId,
    clientSecret,
  };
}

function encryptionKey() {
  const secret =
    process.env.SPOTIFY_COOKIE_SECRET?.trim() ||
    process.env.SAMUEL_ACTION_CONFIRMATION_SECRET?.trim() ||
    process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!secret) throw new Error("Spotify não está configurado no servidor.");
  return crypto.createHash("sha256").update(secret).digest();
}

function seal(value: SpotifySession) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function unseal(value: string): SpotifySession | null {
  try {
    const bytes = Buffer.from(value, "base64url");
    const iv = bytes.subarray(0, 12);
    const tag = bytes.subarray(12, 28);
    const encrypted = bytes.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(json) as SpotifySession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function spotifyReadiness() {
  const config = spotifyConfig();
  return {
    configured: config.configured,
    provider: "spotify-connect",
    detail: config.configured
      ? "Spotify Connect disponível para controlar a conta e os dispositivos do utilizador."
      : "Configure SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET para ativar Spotify Connect.",
  };
}

export function spotifyRedirectUri(origin: string) {
  return (
    process.env.SPOTIFY_REDIRECT_URI?.trim() ||
    new URL("/api/samuel-ai/music/spotify/callback", origin).toString()
  );
}

export async function buildSpotifyAuthorizeUrl(input: {
  companyId: string;
  origin: string;
  returnTo?: string;
}) {
  const config = spotifyConfig();
  if (!config.configured || !config.clientId) {
    throw new Error("Spotify ainda não está configurado no servidor.");
  }

  const state = crypto.randomBytes(24).toString("base64url");
  const returnTo =
    input.returnTo?.startsWith("/") && !input.returnTo.startsWith("//")
      ? input.returnTo
      : "/samuel-ai";

  const store = await cookies();
  const statePayload: SpotifyState = {
    state,
    companyId: input.companyId,
    returnTo,
  };
  store.set(
    SPOTIFY_STATE_COOKIE,
    Buffer.from(JSON.stringify(statePayload), "utf8").toString("base64url"),
    cookieOptions(10 * 60),
  );

  const url = new URL("/authorize", SPOTIFY_ACCOUNTS);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", spotifyRedirectUri(input.origin));
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    [
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
    ].join(" "),
  );
  return url.toString();
}

function readStateCookie(value?: string) {
  if (!value) return null;
  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as SpotifyState;
  } catch {
    return null;
  }
}

async function saveSession(session: SpotifySession) {
  const store = await cookies();
  store.set(
    SPOTIFY_SESSION_COOKIE,
    seal(session),
    cookieOptions(60 * 60 * 24 * 180),
  );
}

export async function completeSpotifyAuthorization(input: {
  code: string;
  state: string;
  origin: string;
}) {
  const config = spotifyConfig();
  if (!config.configured || !config.clientId || !config.clientSecret) {
    throw new Error("Spotify não está configurado no servidor.");
  }

  const store = await cookies();
  const stateCookie = readStateCookie(store.get(SPOTIFY_STATE_COOKIE)?.value);
  store.delete(SPOTIFY_STATE_COOKIE);
  if (!stateCookie || stateCookie.state !== input.state) {
    throw new Error("A autorização Spotify expirou ou é inválida. Tente conectar novamente.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: spotifyRedirectUri(input.origin),
  });
  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(payload.error_description || "Não foi possível conectar ao Spotify.");
  }

  await saveSession({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + Math.max(60, payload.expires_in ?? 3600) * 1000,
  });

  return stateCookie;
}

async function refreshSession(session: SpotifySession) {
  const config = spotifyConfig();
  if (!config.configured || !config.clientId || !config.clientSecret) {
    throw new Error("Spotify não está configurado no servidor.");
  }
  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!response.ok || !payload.access_token) {
    throw new Error("A sessão Spotify expirou. Conecte a conta novamente.");
  }
  const next: SpotifySession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || session.refreshToken,
    expiresAt: Date.now() + Math.max(60, payload.expires_in ?? 3600) * 1000,
  };
  await saveSession(next);
  return next;
}

async function getSession() {
  const store = await cookies();
  const raw = store.get(SPOTIFY_SESSION_COOKIE)?.value;
  const session = raw ? unseal(raw) : null;
  if (!session) return null;
  if (session.expiresAt - Date.now() > 60_000) return session;
  return refreshSession(session);
}

async function spotifyFetch(
  path: string,
  init: RequestInit = {},
  sessionOverride?: SpotifySession,
) {
  const session = sessionOverride ?? (await getSession());
  if (!session) throw new Error("Conecte o Spotify ao Samuel AI primeiro.");

  const response = await fetch(`${SPOTIFY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (response.status === 401 && !sessionOverride) {
    const refreshed = await refreshSession(session);
    return spotifyFetch(path, init, refreshed);
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "O Spotify recusou o controlo de reprodução. Confirme que a conta é Premium e concedeu permissão de reprodução.",
      );
    }
    if (response.status === 404) {
      throw new Error(
        "Nenhum dispositivo Spotify está disponível. Abra o Spotify no telemóvel ou computador e tente novamente.",
      );
    }
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(payload?.error?.message || `Spotify respondeu HTTP ${response.status}.`);
  }
  return response;
}

function toTrack(item: SpotifyTrackItem): SamuelMusicTrack {
  return {
    id: item.id,
    title: item.name,
    artist:
      item.artists?.map((artist) => artist.name).filter(Boolean).join(", ") ||
      "Spotify",
    album: item.album?.name ?? null,
    artworkUrl: item.album?.images?.[0]?.url ?? null,
    previewUrl: null,
    externalUrl: item.external_urls?.spotify ?? null,
    provider: "spotify",
  };
}

async function pickDevice() {
  const response = await spotifyFetch("/me/player/devices");
  const payload = (await response.json()) as { devices?: SpotifyDevice[] };
  const devices = (payload.devices ?? []).filter(
    (device): device is SpotifyDevice & { id: string } => Boolean(device.id),
  );
  if (!devices.length) {
    throw new Error(
      "Abra o Spotify no seu telemóvel ou computador para eu ter um dispositivo onde tocar a música.",
    );
  }
  return devices.find((device) => device.is_active) ?? devices[0];
}

async function playQuery(query: string) {
  const search = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
  );
  const payload = (await search.json()) as {
    tracks?: { items?: SpotifyTrackItem[] };
  };
  const item = payload.tracks?.items?.[0];
  if (!item) throw new Error(`Não encontrei "${query}" no Spotify.`);

  const device = await pickDevice();
  if (!device.is_active) {
    await spotifyFetch("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [device.id], play: false }),
    });
  }
  await spotifyFetch(
    `/me/player/play?device_id=${encodeURIComponent(device.id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ uris: [item.uri] }),
    },
  );
  return { track: toTrack(item), deviceName: device.name ?? "Spotify" };
}

export async function spotifyStatus() {
  const ready = spotifyReadiness();
  if (!ready.configured) return { configured: false, connected: false };

  const session = await getSession().catch(() => null);
  if (!session) return { configured: true, connected: false };

  try {
    const response = await spotifyFetch("/me");
    const profile = (await response.json()) as {
      display_name?: string;
      product?: string;
    };
    return {
      configured: true,
      connected: true,
      displayName: profile.display_name ?? null,
      premium: profile.product === "premium",
    };
  } catch {
    return { configured: true, connected: false };
  }
}

export async function disconnectSpotify() {
  const store = await cookies();
  store.delete(SPOTIFY_SESSION_COOKIE);
}

export async function executeSpotifyCommand(command: SamuelMusicCommand) {
  if (command.action === "play") {
    const query = command.query?.trim();
    if (!query) throw new Error("Diga qual música ou artista deseja ouvir.");
    const result = await playQuery(query);
    return {
      ok: true,
      playing: true,
      track: result.track,
      message: `Tocando ${result.track.title}, de ${result.track.artist}, no ${result.deviceName}.`,
    };
  }

  const device = await pickDevice();
  const target = `?device_id=${encodeURIComponent(device.id)}`;
  if (command.action === "pause" || command.action === "stop") {
    await spotifyFetch(`/me/player/pause${target}`, { method: "PUT" });
    return { ok: true, playing: false, message: "Spotify pausado." };
  }
  if (command.action === "resume") {
    await spotifyFetch(`/me/player/play${target}`, { method: "PUT" });
    return { ok: true, playing: true, message: "Continuando no Spotify." };
  }
  if (command.action === "next") {
    await spotifyFetch(`/me/player/next${target}`, { method: "POST" });
    return { ok: true, playing: true, message: "Próxima faixa no Spotify." };
  }
  if (command.action === "previous") {
    await spotifyFetch(`/me/player/previous${target}`, { method: "POST" });
    return { ok: true, playing: true, message: "Voltando uma faixa no Spotify." };
  }

  let volume: number;
  if (command.action === "set_volume") {
    volume = Math.max(0, Math.min(100, command.volume ?? 70));
  } else {
    const current = await spotifyFetch("/me/player");
    const player = (await current.json().catch(() => ({}))) as {
      device?: { volume_percent?: number };
    };
    const base = player.device?.volume_percent ?? 70;
    volume = Math.max(
      0,
      Math.min(100, base + (command.action === "volume_up" ? 10 : -10)),
    );
  }
  await spotifyFetch(
    `/me/player/volume?volume_percent=${volume}&device_id=${encodeURIComponent(device.id)}`,
    { method: "PUT" },
  );
  return { ok: true, playing: true, volume, message: `Volume do Spotify em ${volume}%.` };
}
