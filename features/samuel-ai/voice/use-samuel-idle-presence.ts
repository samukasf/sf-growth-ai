"use client";

import { useEffect, useState } from "react";

const DEFAULT_SLEEP_AFTER_MS = 2 * 60 * 1000;

export function useSamuelIdlePresence(sleepAfterMs = DEFAULT_SLEEP_AFTER_MS) {
  const [sleeping, setSleeping] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleSleep = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSleeping(true), sleepAfterMs);
    };

    const wakeSamuel = () => {
      setSleeping(false);
      scheduleSleep();
    };

    scheduleSleep();
    window.addEventListener("pointerdown", wakeSamuel, { passive: true });
    window.addEventListener("keydown", wakeSamuel);
    window.addEventListener("touchstart", wakeSamuel, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointerdown", wakeSamuel);
      window.removeEventListener("keydown", wakeSamuel);
      window.removeEventListener("touchstart", wakeSamuel);
    };
  }, [sleepAfterMs]);

  return sleeping;
}
