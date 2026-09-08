"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Device = {
  id: string;
  company_id: string | null;
  device_name: string;
  platform: string;
  status: "pending" | "paired" | "paused" | "revoked";
  capabilities: string[];
  last_seen_at: string | null;
  paired_at: string | null;
  created_at: string;
};

type Command = {
  id: string;
  device_id: string;
  action: string;
  risk: string;
  status: string;
  result: unknown;
  evidence: unknown;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

type Snapshot = { devices: Device[]; commands: Command[] };

async function api(body?: Record<string, unknown>): Promise<Snapshot | Record<string, unknown>> {
  const response = await fetch("/api/samuel-desktop/control", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.error || "Falha no Samuel Desktop."));
  return payload as Snapshot | Record<string, unknown>;
}

function relativeTime(value: string | null) {
  if (!value) return "nunca";
  const seconds = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 1000));
  if (seconds < 10) return "agora";
  if (seconds < 60) return `há ${seconds}s`;
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
  return `há ${Math.floor(seconds / 3600)} h`;
}

export default function SamuelDesktopPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>({ devices: [], commands: [] });
  const [pairingCode, setPairingCode] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = (await api()) as Snapshot;
      setSnapshot(data);
      setSelectedDevice((current) =>
        current && data.devices.some((device) => device.id === current)
          ? current
          : data.devices.find((device) => device.status === "paired")?.id ?? data.devices[0]?.id ?? "",
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar dispositivos.");
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 4_000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [load]);

  const selected = useMemo(
    () => snapshot.devices.find((device) => device.id === selectedDevice) ?? null,
    [selectedDevice, snapshot.devices],
  );

  async function claim() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api({ operation: "claim", pairingCode: pairingCode.replace(/\D/g, "") });
      setPairingCode("");
      setNotice("Computador pareado. O Samuel Desktop já pode receber tarefas desta conta.");
      await load();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Falha no pareamento.");
    } finally {
      setBusy(false);
    }
  }

  async function runTask() {
    if (!selected || !goal.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api({
        operation: "command",
        deviceId: selected.id,
        action: "computer.task",
        args: { goal: goal.trim() },
        risk: "sensitive",
        approved: true,
        approvalReference: `desktop-panel:${Date.now()}`,
      });
      setNotice("Tarefa enviada ao computador. O Samuel irá observar, agir e verificar cada passo.");
      setGoal("");
      await load();
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Falha ao enviar a tarefa.");
    } finally {
      setBusy(false);
    }
  }

  async function setDeviceStatus(device: Device, next: "paired" | "paused" | "revoked") {
    if (next === "revoked" && !window.confirm(`Remover ${device.device_name} da sua conta?`)) return;
    setBusy(true);
    setError(null);
    try {
      await api({ operation: "device_status", deviceId: device.id, status: next });
      await load();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Falha ao atualizar dispositivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05080c] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-300/70">SF Growth AI</p>
            <h1 className="mt-1 text-2xl font-semibold">Samuel Desktop</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Conecte seu Windows ao Samuel para permitir execução supervisionada em navegador, aplicativos, arquivos, mouse e teclado.
            </p>
          </div>
          <Link href="/samuel-ai" className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[.08]">Voltar ao Samuel</Link>
        </header>

        {error && <div className="mb-5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}

        <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/[.08] bg-white/[.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">1 · Parear computador</p>
            <h2 className="mt-2 text-lg font-semibold">Digite o código do aplicativo Windows</h2>
            <input
              value={pairingCode}
              onChange={(event) => setPairingCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              placeholder="00000000"
              className="mt-5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-center font-mono text-3xl tracking-[.22em] outline-none focus:border-cyan-300/50"
            />
            <button type="button" disabled={busy || pairingCode.length !== 8} onClick={() => void claim()} className="mt-3 w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold disabled:opacity-40">Parear Samuel Desktop</button>
            <p className="mt-3 text-xs leading-5 text-white/35">O código é de uso único e expira em 10 minutos. O segredo do dispositivo fica protegido pelo cofre do Windows.</p>
          </div>

          <div className="rounded-3xl border border-white/[.08] bg-white/[.035] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">2 · Dispositivos</p><h2 className="mt-2 text-lg font-semibold">Computadores conectados</h2></div>
              <button type="button" onClick={() => void load()} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55">Atualizar</button>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.devices.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/35">Nenhum computador pareado ainda.</p>}
              {snapshot.devices.map((device) => (
                <div key={device.id} className={`rounded-2xl border p-4 ${selectedDevice === device.id ? "border-cyan-300/35 bg-cyan-300/[.04]" : "border-white/[.07] bg-black/15"}`}>
                  <button type="button" onClick={() => setSelectedDevice(device.id)} className="w-full text-left">
                    <div className="flex items-center justify-between gap-3"><strong className="text-sm">{device.device_name}</strong><span className="text-[10px] uppercase tracking-wider text-white/40">{device.status}</span></div>
                    <p className="mt-1 text-xs text-white/35">{device.platform} · visto {relativeTime(device.last_seen_at)}</p>
                  </button>
                  <div className="mt-3 flex gap-2">
                    {device.status === "paused" ? (
                      <button type="button" disabled={busy} onClick={() => void setDeviceStatus(device, "paired")} className="rounded-lg border border-emerald-400/20 px-3 py-1.5 text-[11px] text-emerald-200">Retomar</button>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => void setDeviceStatus(device, "paused")} className="rounded-lg border border-amber-400/20 px-3 py-1.5 text-[11px] text-amber-200">Pausar</button>
                    )}
                    <button type="button" disabled={busy} onClick={() => void setDeviceStatus(device, "revoked")} className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-[11px] text-rose-200">Remover</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/[.08] bg-white/[.035] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">3 · Teste de computer use</p>
          <h2 className="mt-2 text-lg font-semibold">Diga o que o Samuel deve fazer neste computador</h2>
          <p className="mt-2 text-xs leading-5 text-white/35">Ao clicar em Executar você confirma esta tarefa específica. A cada passo o Samuel recebe uma nova captura de tela e só conclui quando houver evidência visual.</p>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value.slice(0, 4000))}
            placeholder="Ex.: Abra o Chrome, entre no site da Grafgil e pare quando a página inicial estiver visível."
            rows={4}
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 outline-none focus:border-cyan-300/50"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-white/35">Destino: {selected?.device_name ?? "selecione um computador"}</span>
            <button type="button" disabled={busy || !selected || selected.status !== "paired" || !goal.trim()} onClick={() => void runTask()} className="rounded-2xl bg-blue-500 px-5 py-2.5 text-sm font-semibold disabled:opacity-40">Executar no computador</button>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/[.08] bg-white/[.035] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">Execução e evidências</p>
          <div className="mt-4 space-y-2">
            {snapshot.commands.length === 0 && <p className="text-sm text-white/35">Nenhum comando executado.</p>}
            {snapshot.commands.slice(0, 15).map((command) => (
              <div key={command.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[.06] bg-black/15 px-4 py-3">
                <div><strong className="text-xs">{command.action}</strong><p className="mt-1 text-[10px] text-white/30">{new Date(command.created_at).toLocaleString()} · {command.risk}</p>{command.error_message && <p className="mt-1 max-w-xl text-xs text-rose-200/75">{command.error_message}</p>}</div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${command.status === "verified" ? "bg-emerald-400/10 text-emerald-200" : command.status === "failed" ? "bg-rose-400/10 text-rose-200" : "bg-white/[.06] text-white/45"}`}>{command.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
