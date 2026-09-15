"use client";

import { useEffect, useState } from "react";

import { LoaderCircle, MessageCircleMore } from "lucide-react";

type Props = {
  appId: string;
  configId: string;
  graphVersion: string;
  companyId: string;
};

type EmbeddedSession = {
  wabaId: string;
  phoneNumberId?: string;
  businessId?: string;
};

type FacebookLoginResponse = {
  authResponse?: { code?: string };
  status?: string;
};

type FacebookSdk = {
  init: (options: Record<string, unknown>) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

function trustedMetaOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === "facebook.com" || hostname.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

export function EmbeddedSignupButton({ appId, configId, graphVersion, companyId }: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [session, setSession] = useState<EmbeddedSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!trustedMetaOrigin(event.origin)) return;
      let payload: unknown = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      if (!payload || typeof payload !== "object") return;
      const record = payload as {
        type?: string;
        event?: string;
        data?: { waba_id?: string; phone_number_id?: string; business_id?: string };
      };
      if (record.type !== "WA_EMBEDDED_SIGNUP") return;
      if (!record.event?.toUpperCase().includes("FINISH")) return;
      const wabaId = record.data?.waba_id?.trim();
      if (!wabaId) return;
      setSession({
        wabaId,
        phoneNumberId: record.data?.phone_number_id?.trim() || undefined,
        businessId: record.data?.business_id?.trim() || undefined,
      });
    };

    window.addEventListener("message", onMessage);
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version: graphVersion,
      });
      setSdkReady(true);
    };

    const existing = document.getElementById("facebook-jssdk");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/pt_BR/sdk.js";
      document.body.appendChild(script);
    } else if (window.FB) {
      window.fbAsyncInit();
    }

    return () => window.removeEventListener("message", onMessage);
  }, [appId, graphVersion]);

  useEffect(() => {
    if (!pendingCode || !session?.wabaId) return;
    let cancelled = false;
    const complete = async () => {
      setBusy(true);
      setError(null);
      try {
        const response = await fetch("/api/integrations/whatsapp/embedded-signup/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            code: pendingCode,
            wabaId: session.wabaId,
            phoneNumberId: session.phoneNumberId,
            businessId: session.businessId,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error || "Falha ao concluir conexão WhatsApp.");
        if (!cancelled) {
          window.location.href = `/integrations/whatsapp/connect?companyId=${encodeURIComponent(companyId)}&connected=1`;
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Falha ao concluir conexão WhatsApp.");
          setBusy(false);
        }
      }
    };
    void complete();
    return () => {
      cancelled = true;
    };
  }, [companyId, pendingCode, session]);

  const launch = () => {
    setError(null);
    setPendingCode(null);
    setSession(null);
    if (!window.FB || !sdkReady) {
      setError("O SDK da Meta ainda está carregando. Aguarde alguns segundos e tente novamente.");
      return;
    }

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code?.trim();
        if (!code) {
          setError("O onboarding foi cancelado ou a Meta não devolveu o código de autorização.");
          return;
        }
        setPendingCode(code);
      },
      {
        config_id: configId,
        auth_type: "rerequest",
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {} },
      },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={launch}
        disabled={!sdkReady || busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-[#04120a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : <MessageCircleMore className="size-4" />}
        {busy ? "Concluindo conexão..." : sdkReady ? "Conectar meu WhatsApp Business" : "Carregando Meta..."}
      </button>
      {error && <p className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[.05] px-3 py-2 text-[10px] leading-5 text-rose-100/70">{error}</p>}
    </div>
  );
}
