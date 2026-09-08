import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type WindowInfo = {
  id: number;
  processName: string;
  title: string;
  handle: number;
};

function psQuote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

export async function runPowerShell(script: string, timeout = 20_000) {
  const { stdout, stderr } = await execFileAsync(
    "powershell.exe",
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
    { timeout, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
  );
  if (stderr?.trim()) {
    // PowerShell writes some non-fatal diagnostics to stderr; only surface them when stdout is empty.
    if (!stdout?.trim()) throw new Error(stderr.trim().slice(0, 2000));
  }
  return stdout.trim();
}

function normalizeJsonList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return value && typeof value === "object" ? [value as T] : [];
}

export async function listWindows(): Promise<WindowInfo[]> {
  const output = await runPowerShell(
    "$items = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle } | " +
      "Select-Object @{N='id';E={$_.Id}},@{N='processName';E={$_.ProcessName}},@{N='title';E={$_.MainWindowTitle}},@{N='handle';E={[int64]$_.MainWindowHandle}}; " +
      "$items | ConvertTo-Json -Compress",
  );
  if (!output) return [];
  try {
    return normalizeJsonList<WindowInfo>(JSON.parse(output)).slice(0, 200);
  } catch {
    return [];
  }
}

export async function openApplication(file: string, args: string[] = []) {
  if (!file.trim() || file.length > 1000) throw new Error("Aplicativo inválido.");
  const safeArgs = args.slice(0, 24).map((arg) => psQuote(String(arg).slice(0, 2000))).join(",");
  const script = [
    `$p = Start-Process -FilePath ${psQuote(file)}${safeArgs ? ` -ArgumentList @(${safeArgs})` : ""} -PassThru`,
    "Start-Sleep -Milliseconds 500",
    "$p.Refresh()",
    "$p | Select-Object @{N='id';E={$_.Id}},@{N='processName';E={$_.ProcessName}},@{N='handle';E={[int64]$_.MainWindowHandle}} | ConvertTo-Json -Compress",
  ].join("; ");
  const output = await runPowerShell(script, 30_000);
  return output ? JSON.parse(output) : { launched: true };
}

const WINDOW_API = `
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class SamuelWindowApi {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}
'@;
`;

export async function focusWindow(handle: number) {
  if (!Number.isFinite(handle) || handle <= 0) throw new Error("Janela inválida.");
  const output = await runPowerShell(
    `${WINDOW_API} [SamuelWindowApi]::ShowWindowAsync([IntPtr]${Math.trunc(handle)}, 9) | Out-Null; ` +
      `[SamuelWindowApi]::SetForegroundWindow([IntPtr]${Math.trunc(handle)}) | ConvertTo-Json -Compress`,
  );
  return output === "true";
}

const POINTER_API = `
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class SamuelPointerApi {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, int data, UIntPtr extraInfo);
}
'@;
[SamuelPointerApi]::SetProcessDPIAware() | Out-Null;
`;

function boundedCoordinate(value: number) {
  if (!Number.isFinite(value)) throw new Error("Coordenada inválida.");
  return Math.max(-16_384, Math.min(32_768, Math.round(value)));
}

export async function clickPointer(x: number, y: number, doubleClick = false) {
  const px = boundedCoordinate(x);
  const py = boundedCoordinate(y);
  const clicks = doubleClick ? 2 : 1;
  const body = Array.from({ length: clicks }, () =>
    "[SamuelPointerApi]::mouse_event(0x0002,0,0,0,[UIntPtr]::Zero); " +
      "[SamuelPointerApi]::mouse_event(0x0004,0,0,0,[UIntPtr]::Zero); Start-Sleep -Milliseconds 90;",
  ).join(" ");
  await runPowerShell(
    `${POINTER_API} [SamuelPointerApi]::SetCursorPos(${px},${py}) | Out-Null; Start-Sleep -Milliseconds 60; ${body}`,
  );
}

export async function scrollPointer(delta: number) {
  const normalized = Math.max(-2400, Math.min(2400, Math.round(delta || 0)));
  if (!normalized) return;
  await runPowerShell(
    `${POINTER_API} [SamuelPointerApi]::mouse_event(0x0800,0,0,${normalized},[UIntPtr]::Zero);`,
  );
}

const KEY_CODES: Record<string, number> = {
  CTRL: 0x11,
  CONTROL: 0x11,
  ALT: 0x12,
  SHIFT: 0x10,
  WIN: 0x5b,
  WINDOWS: 0x5b,
  ENTER: 0x0d,
  RETURN: 0x0d,
  ESC: 0x1b,
  ESCAPE: 0x1b,
  TAB: 0x09,
  BACKSPACE: 0x08,
  DELETE: 0x2e,
  SPACE: 0x20,
  LEFT: 0x25,
  UP: 0x26,
  RIGHT: 0x27,
  DOWN: 0x28,
  HOME: 0x24,
  END: 0x23,
  PAGEUP: 0x21,
  PAGEDOWN: 0x22,
  F1: 0x70,
  F2: 0x71,
  F3: 0x72,
  F4: 0x73,
  F5: 0x74,
  F6: 0x75,
  F7: 0x76,
  F8: 0x77,
  F9: 0x78,
  F10: 0x79,
  F11: 0x7a,
  F12: 0x7b,
};

function keyCode(key: string) {
  const normalized = key.trim().toUpperCase();
  if (KEY_CODES[normalized]) return KEY_CODES[normalized];
  if (/^[A-Z]$/.test(normalized)) return normalized.charCodeAt(0);
  if (/^[0-9]$/.test(normalized)) return normalized.charCodeAt(0);
  throw new Error(`Tecla não suportada: ${key}`);
}

export async function sendShortcut(keys: string[]) {
  const codes = keys.slice(0, 8).map(keyCode);
  if (!codes.length) throw new Error("Atalho vazio.");
  const codeArray = codes.join(",");
  const script = `
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class SamuelKeyboardApi {
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extraInfo);
}
'@;
$keys = @(${codeArray});
foreach ($k in $keys) { [SamuelKeyboardApi]::keybd_event([byte]$k,0,0,[UIntPtr]::Zero); Start-Sleep -Milliseconds 35 }
[array]::Reverse($keys);
foreach ($k in $keys) { [SamuelKeyboardApi]::keybd_event([byte]$k,0,2,[UIntPtr]::Zero); Start-Sleep -Milliseconds 25 }
`;
  await runPowerShell(script);
}
