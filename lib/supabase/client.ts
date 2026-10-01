import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const configuredUrl = readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const configuredAnonKey = readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * The UI has graceful empty states when Supabase is not configured. Creating the
 * SDK with `undefined` at module evaluation time prevented those states from ever
 * rendering (and broke `next build`). A local, non-routable fallback keeps the
 * client constructible while every real request still fails closed.
 */
export const isSupabaseConfigured = Boolean(
  configuredUrl && configuredAnonKey,
);

/**
 * @supabase/realtime-js crashes on Node < 22 when no native WebSocket exists.
 * Provide a no-op transport so module import stays safe in CI/tests/SSR without
 * enabling realtime subscriptions in those environments.
 */
class NoopWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;
  readyState = NoopWebSocket.CLOSED;
  url = "";
  protocol = "";
  extensions = "";
  binaryType: BinaryType = "blob";
  bufferedAmount = 0;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onopen: ((ev: Event) => void) | null = null;

  constructor(_url?: string | URL, _protocols?: string | string[]) {}

  close(_code?: number, _reason?: string) {
    this.readyState = NoopWebSocket.CLOSED;
  }

  send(_data: string | ArrayBufferLike | Blob | ArrayBufferView) {}

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent(_event: Event) {
    return false;
  }
}

function hasNativeWebSocket() {
  return typeof WebSocket !== "undefined";
}

function createSupabaseBrowserClient(): SupabaseClient {
  return createClient(
    configuredUrl ?? "http://127.0.0.1:54321",
    configuredAnonKey ?? "sf-growth-ai-unconfigured-anon-key",
    {
      auth: {
        autoRefreshToken: isSupabaseConfigured,
        detectSessionInUrl: isSupabaseConfigured,
        persistSession: isSupabaseConfigured,
      },
      realtime: hasNativeWebSocket()
        ? undefined
        : {
            // Cast keeps us compatible across supabase realtime transport typings.
            transport: NoopWebSocket as unknown as typeof WebSocket,
          },
    },
  );
}

export const supabase = createSupabaseBrowserClient();
