"use client";

import { useEffect, useState } from "react";

import type { VercelDeploymentStatus } from "./vercel-deployment.types";

async function fetchDeploymentStatus(signal?: AbortSignal) {
  const response = await fetch("/api/integrations/vercel/status", {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("Falha ao consultar o deploy");
  return await response.json() as VercelDeploymentStatus;
}

export function useVercelDeploymentStatus() {
  const [status, setStatus] = useState<VercelDeploymentStatus | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void fetchDeploymentStatus(controller.signal)
        .then((payload) => {
          if (!cancelled) setStatus(payload);
        })
        .catch(() => {
          // An unavailable monitor must never be presented as a failed deploy.
        });
    };

    refresh();
    const interval = window.setInterval(refresh, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return status;
}
