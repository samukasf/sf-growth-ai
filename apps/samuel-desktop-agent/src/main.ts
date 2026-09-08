import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  clipboard,
  desktopCapturer,
  dialog,
  globalShortcut,
  ipcMain,
  nativeImage,
  safeStorage,
  screen,
  shell,
} from "electron";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import { appendFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  clickPointer,
  focusWindow,
  listWindows,
  openApplication,
  scrollPointer,
  sendShortcut,
} from "./windows";

type AgentConfig = {
  baseUrl: string;
  deviceId?: string;
  encryptedToken?: string;
  encryptedCommandSecret?: string;
  paired?: boolean;
  pairingCode?: string;
  pairingExpiresAt?: string;
  companyId?: string | null;
  allowedFolders: string[];
  paused: boolean;
};

type DeviceCommand = {
  id: string;
  action: string;
  args: Record<string, unknown>;
  risk: "read" | "draft" | "mutate" | "sensitive";
  approvalReference?: string | null;
  expiresAt: string;
};

type SignedEnvelope = { payload: string; signature: string };
type Screenshot = {
  dataUrl: string;
  png: Buffer;
  width: number;
  height: number;
  hash: string;
};

type UiState = {
  status: string;
  deviceName: string;
  deviceId: string | null;
  paired: boolean;
  pairingCode: string | null;
  pairingExpiresAt: string | null;
  paused: boolean;
  currentCommand: string | null;
  lastActivity: string;
  allowedFolders: string[];
  baseUrl: string;
};

const DEFAULT_BASE_URL = "https://sf-growth-ai.vercel.app";
const POLL_MS = 1_500;
const MAX_FILE_READ_BYTES = 1_000_000;
const MAX_FILE_WRITE_BYTES = 2_000_000;
const MAX_COMPUTER_STEPS = 40;
const TRAY_ICON = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDUlEQVR4nM2Xyw3DIAyGSdWiIpUpskhGzyKZIodKvbSnRIQav1PqK2B//MZghtv98Q4d7dIzeAghXKULxnlFx5cpi/wN3BRQgbUgJIA0sBQEBWgFbzmVzkcBamfS3HLXg1VgDQ6taanzBeARXAKBluHm4PXUHcSYclimjB7kgwLlRMvOayt91TDkTajdPdf2FLRkiimDEDHpFRrndVcFVKCWHwomVUZUhpB5QJgAWhA/BYAgrCqo+gFPCLeGRAvBegsgkx5K8i3Q3HzayihjsVoyqbzbfE7VHFKA3dkWw94Y9BB6QFA+wI7Iqyfg+GG9BRoluJv436aUcso1U1tuAXH7mEhBTvuanWXdf8cfkxmNKnt4CykAAAAASUVORK5CYII=";

let config: AgentConfig;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let pollTimer: NodeJS.Timeout | null = null;
let polling = false;
let currentCommandId: string | null = null;
let stopRequested = false;
let status = "Inicializando";
let lastActivity = "Aguardando inicialização";

function configPath() {
  return path.join(app.getPath("userData"), "samuel-desktop.json");
}

function logPath() {
  return path.join(app.getPath("userData"), "samuel-desktop-events.jsonl");
}

function deviceName() {
  return `${os.hostname()} · ${process.platform}`.slice(0, 120);
}

function nowIso() {
  return new Date().toISOString();
}

function audit(event: string, payload: Record<string, unknown> = {}) {
  try {
    appendFileSync(logPath(), `${JSON.stringify({ at: nowIso(), event, ...payload })}\n`, "utf8");
  } catch {
    // Local audit failure should not crash the agent.
  }
}

function setActivity(nextStatus: string, activity: string) {
  status = nextStatus;
  lastActivity = activity;
  audit("state", { status: nextStatus, activity });
  sendState();
}

function defaultConfig(): AgentConfig {
  return {
    baseUrl: (process.env.SAMUEL_DESKTOP_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    allowedFolders: [],
    paused: false,
  };
}

async function loadConfig() {
  try {
    const raw = await fs.readFile(configPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<AgentConfig>;
    config = {
      ...defaultConfig(),
      ...parsed,
      baseUrl: String(parsed.baseUrl || process.env.SAMUEL_DESKTOP_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
      allowedFolders: Array.isArray(parsed.allowedFolders)
        ? parsed.allowedFolders.filter((item): item is string => typeof item === "string")
        : [],
      paused: parsed.paused === true,
    };
  } catch {
    config = defaultConfig();
  }
}

async function saveConfig() {
  const target = configPath();
  const temporary = `${target}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(temporary, JSON.stringify(config, null, 2), "utf8");
  await fs.rename(temporary, target);
}

function encryptSecret(value: string) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("O cofre seguro do Windows não está disponível. O Samuel não armazenará credenciais em texto puro.");
  }
  return safeStorage.encryptString(value).toString("base64");
}

function decryptSecret(value: string | undefined) {
  if (!value) return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(value, "base64"));
  } catch {
    return null;
  }
}

function deviceToken() {
  return decryptSecret(config.encryptedToken);
}

function commandSecret() {
  return decryptSecret(config.encryptedCommandSecret);
}

async function postJson<T>(pathname: string, body: unknown, authenticated = true): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated) {
    const token = deviceToken();
    if (!token) throw new Error("Dispositivo ainda não registrado.");
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${config.baseUrl}${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(payload.error || `Falha HTTP ${response.status}`));
  }
  return payload as T;
}

async function registerDevice(force = false) {
  if (!force && config.deviceId && deviceToken() && commandSecret()) return;

  setActivity("Registrando", "Criando vínculo seguro com o SF Growth AI");
  const response = await postJson<{
    deviceId: string;
    token: string;
    commandSecret: string;
    pairingCode: string;
    expiresAt: string;
  }>(
    "/api/samuel-desktop/device",
    {
      action: "register",
      deviceName: deviceName(),
      platform: "windows",
      capabilities: [
        "windows.list",
        "windows.focus",
        "apps.open",
        "screen.capture",
        "pointer.click",
        "pointer.scroll",
        "keyboard.type",
        "keyboard.shortcut",
        "files.scoped_read_write",
        "computer.visual_loop",
      ],
    },
    false,
  );

  config.deviceId = response.deviceId;
  config.encryptedToken = encryptSecret(response.token);
  config.encryptedCommandSecret = encryptSecret(response.commandSecret);
  config.paired = false;
  config.pairingCode = response.pairingCode;
  config.pairingExpiresAt = response.expiresAt;
  config.companyId = null;
  await saveConfig();
  audit("registered", { deviceId: response.deviceId, expiresAt: response.expiresAt });
  setActivity("Aguardando pareamento", "Digite o código exibido no painel SF Growth AI");
}

async function refreshPairingIfExpired() {
  if (config.paired) return;
  if (!config.pairingExpiresAt || Date.parse(config.pairingExpiresAt) > Date.now() + 5_000) return;
  config.deviceId = undefined;
  config.encryptedToken = undefined;
  config.encryptedCommandSecret = undefined;
  config.pairingCode = undefined;
  config.pairingExpiresAt = undefined;
  await saveConfig();
  await registerDevice(true);
}

function uiState(): UiState {
  return {
    status,
    deviceName: deviceName(),
    deviceId: config.deviceId ?? null,
    paired: config.paired === true,
    pairingCode: config.paired ? null : config.pairingCode ?? null,
    pairingExpiresAt: config.paired ? null : config.pairingExpiresAt ?? null,
    paused: config.paused,
    currentCommand: currentCommandId,
    lastActivity,
    allowedFolders: config.allowedFolders,
    baseUrl: config.baseUrl,
  };
}

function sendState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("samuel:state", uiState());
}

async function checkPairing() {
  if (!config.deviceId || !deviceToken()) return;
  const response = await postJson<{
    status: string;
    paired: boolean;
    companyId: string | null;
  }>("/api/samuel-desktop/device", { action: "pair_status" });

  const linked = response.status === "paired" || response.status === "paused";
  if (linked && !config.paired) {
    config.paired = true;
    config.pairingCode = undefined;
    config.pairingExpiresAt = undefined;
    config.companyId = response.companyId;
    await saveConfig();
    setActivity("Conectado", "Samuel Desktop pareado com sua conta");
  }
  if (response.status === "revoked") {
    config.paired = false;
    await saveConfig();
    setActivity("Revogado", "Este computador foi removido no SF Growth AI");
  }
  if (response.status === "paused") setActivity("Pausado remotamente", "Execução bloqueada pelo painel SF Growth AI");
}

function verifyEnvelope(envelope: SignedEnvelope): DeviceCommand {
  const secret = commandSecret();
  if (!secret) throw new Error("Segredo de comando indisponível.");
  const expected = createHmac("sha256", secret).update(envelope.payload).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(envelope.signature || ""));
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Assinatura do comando inválida.");

  const decoded = Buffer.from(envelope.payload, "base64url").toString("utf8");
  const command = JSON.parse(decoded) as DeviceCommand;
  if (!command.id || !command.action || !command.expiresAt) throw new Error("Envelope de comando inválido.");
  if (Date.parse(command.expiresAt) <= Date.now()) throw new Error("Comando expirado.");
  if ((command.risk === "mutate" || command.risk === "sensitive") && !command.approvalReference) {
    throw new Error("Comando mutável sem aprovação vinculada.");
  }
  return command;
}

function isScoped(candidate: string, root: string) {
  const normalizedCandidate = path.resolve(candidate).toLowerCase();
  const normalizedRoot = path.resolve(root).replace(/[\\/]+$/, "").toLowerCase();
  return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}${path.sep}`);
}

async function resolveScopedPath(target: string, forWrite = false) {
  if (!target || target.length > 4096) throw new Error("Caminho inválido.");
  const candidate = path.resolve(target);
  const roots = config.allowedFolders.map((root) => path.resolve(root));
  if (!roots.some((root) => isScoped(candidate, root))) {
    throw new Error("O caminho está fora das pastas autorizadas no Samuel Desktop.");
  }

  if (!forWrite) {
    const realCandidate = await fs.realpath(candidate);
    const realRoots = await Promise.all(roots.map((root) => fs.realpath(root).catch(() => root)));
    if (!realRoots.some((root) => isScoped(realCandidate, root))) {
      throw new Error("O arquivo resolve para fora das pastas autorizadas.");
    }
    return realCandidate;
  }

  const parent = path.dirname(candidate);
  const realParent = await fs.realpath(parent);
  const realRoots = await Promise.all(roots.map((root) => fs.realpath(root).catch(() => root)));
  if (!realRoots.some((root) => isScoped(realParent, root))) {
    throw new Error("A pasta de destino não está autorizada.");
  }
  return candidate;
}

async function capturePrimaryScreen(): Promise<Screenshot> {
  const display = screen.getPrimaryDisplay();
  const targetWidth = Math.max(640, Math.round(display.size.width * display.scaleFactor));
  const targetHeight = Math.max(480, Math.round(display.size.height * display.scaleFactor));
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: targetWidth, height: targetHeight },
  });
  const matching = sources.find((source) => source.display_id === String(display.id)) ?? sources[0];
  if (!matching || matching.thumbnail.isEmpty()) throw new Error("Não foi possível capturar a tela principal.");
  const png = matching.thumbnail.toPNG();
  const size = matching.thumbnail.getSize();
  return {
    png,
    dataUrl: `data:image/png;base64,${png.toString("base64")}`,
    width: size.width,
    height: size.height,
    hash: createHash("sha256").update(png).digest("hex"),
  };
}

async function saveScreenshot(snapshot: Screenshot) {
  const directory = path.join(app.getPath("userData"), "snapshots");
  await fs.mkdir(directory, { recursive: true });
  const target = path.join(directory, `${Date.now()}.png`);
  await fs.writeFile(target, snapshot.png);
  return target;
}

async function pasteText(text: string) {
  const value = text.slice(0, 20_000);
  const previous = clipboard.readText();
  clipboard.writeText(value);
  try {
    await sendShortcut(["CTRL", "V"]);
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 180));
    clipboard.writeText(previous);
  }
}

async function verifyWithScreenshot(kind: string, details: Record<string, unknown> = {}) {
  await new Promise((resolve) => setTimeout(resolve, 550));
  const snapshot = await capturePrimaryScreen();
  return {
    type: "screen-evidence",
    kind,
    sha256: snapshot.hash,
    width: snapshot.width,
    height: snapshot.height,
    capturedAt: nowIso(),
    ...details,
  };
}

async function runComputerTask(command: DeviceCommand) {
  const goal = String(command.args.goal ?? "").trim().slice(0, 4000);
  if (!goal) throw new Error("A tarefa visual não possui objetivo.");
  if (command.risk !== "sensitive" || !command.approvalReference) {
    throw new Error("Computer use exige aprovação sensível vinculada.");
  }

  const history: Array<Record<string, unknown>> = [];
  stopRequested = false;

  for (let step = 0; step < MAX_COMPUTER_STEPS; step += 1) {
    if (stopRequested) throw new Error("Tarefa interrompida pelo botão STOP SAMUEL.");
    const snapshot = await capturePrimaryScreen();
    setActivity("Executando", `Computer use · passo ${step + 1}: analisando a tela`);

    const response = await postJson<{
      action: {
        action: string;
        x: number | null;
        y: number | null;
        text: string | null;
        keys: string[];
        delta: number | null;
        message: string;
        verify: string;
      };
      model: string;
    }>("/api/samuel-desktop/computer-step", {
      commandId: command.id,
      goal,
      screenshot: snapshot.dataUrl,
      width: snapshot.width,
      height: snapshot.height,
      step,
      history,
    });

    const action = response.action;
    history.push({
      step,
      screenshot: snapshot.hash,
      action: action.action,
      message: action.message,
      x: action.x,
      y: action.y,
      keys: action.keys,
    });
    if (history.length > 20) history.shift();

    setActivity("Executando", action.message || `Computer use · ${action.action}`);

    switch (action.action) {
      case "click":
        if (action.x == null || action.y == null) throw new Error("Clique sem coordenadas.");
        await clickPointer(action.x, action.y, false);
        break;
      case "double_click":
        if (action.x == null || action.y == null) throw new Error("Duplo clique sem coordenadas.");
        await clickPointer(action.x, action.y, true);
        break;
      case "type":
        if (typeof action.text !== "string") throw new Error("Digitação sem texto.");
        await pasteText(action.text);
        break;
      case "shortcut":
        await sendShortcut(Array.isArray(action.keys) ? action.keys : []);
        break;
      case "scroll":
        await scrollPointer(Number(action.delta) || -480);
        break;
      case "wait":
        await new Promise((resolve) => setTimeout(resolve, 1_200));
        break;
      case "fail":
        throw new Error(action.message || "O Samuel precisa que você assuma esta etapa.");
      case "done": {
        const finalSnapshot = await capturePrimaryScreen();
        return {
          result: {
            completed: true,
            message: action.message,
            verification: action.verify,
            steps: step + 1,
            model: response.model,
          },
          evidence: {
            type: "visual-completion",
            sha256: finalSnapshot.hash,
            width: finalSnapshot.width,
            height: finalSnapshot.height,
            verification: action.verify,
            capturedAt: nowIso(),
          },
        };
      }
      default:
        throw new Error(`Ação visual não suportada: ${action.action}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  throw new Error(`A tarefa excedeu o limite seguro de ${MAX_COMPUTER_STEPS} passos.`);
}

async function executeCommand(command: DeviceCommand): Promise<{ result: unknown; evidence: unknown }> {
  const args = command.args ?? {};

  switch (command.action) {
    case "system.apps.list":
    case "system.windows.list": {
      const windows = await listWindows();
      return {
        result: { windows },
        evidence: { type: "window-snapshot", count: windows.length, capturedAt: nowIso() },
      };
    }

    case "system.app.open": {
      const file = String(args.file ?? "").trim();
      const process = await openApplication(
        file,
        Array.isArray(args.args) ? args.args.map(String).slice(0, 24) : [],
      );
      return { result: process, evidence: await verifyWithScreenshot("app-open", { file }) };
    }

    case "system.window.focus": {
      const handle = Number(args.handle);
      const focused = await focusWindow(handle);
      if (!focused) throw new Error("O Windows não confirmou o foco da janela.");
      return { result: { focused, handle }, evidence: await verifyWithScreenshot("window-focus", { handle }) };
    }

    case "system.screenshot": {
      const snapshot = await capturePrimaryScreen();
      const savedPath = await saveScreenshot(snapshot);
      return {
        result: { savedPath, width: snapshot.width, height: snapshot.height },
        evidence: { type: "screenshot", sha256: snapshot.hash, width: snapshot.width, height: snapshot.height, capturedAt: nowIso() },
      };
    }

    case "browser.open": {
      const url = String(args.url ?? "").trim();
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Somente URLs HTTP/HTTPS são permitidas.");
      await shell.openExternal(parsed.toString());
      return { result: { opened: parsed.toString() }, evidence: await verifyWithScreenshot("browser-open", { url: parsed.toString() }) };
    }

    case "files.read": {
      const target = await resolveScopedPath(String(args.path ?? ""));
      const stats = await fs.stat(target);
      if (!stats.isFile()) throw new Error("O caminho não é um arquivo.");
      if (stats.size > MAX_FILE_READ_BYTES) throw new Error("Arquivo grande demais para leitura direta; limite local de 1 MB.");
      const buffer = await fs.readFile(target);
      return {
        result: { path: target, content: buffer.toString("utf8"), bytes: buffer.length },
        evidence: { type: "file-read", path: target, sha256: createHash("sha256").update(buffer).digest("hex"), bytes: buffer.length },
      };
    }

    case "files.write": {
      const target = await resolveScopedPath(String(args.path ?? ""), true);
      const content = String(args.content ?? "");
      const buffer = Buffer.from(content, "utf8");
      if (buffer.length > MAX_FILE_WRITE_BYTES) throw new Error("Conteúdo grande demais; limite local de 2 MB.");
      await fs.writeFile(target, buffer);
      const written = await fs.readFile(target);
      const checksum = createHash("sha256").update(written).digest("hex");
      if (checksum !== createHash("sha256").update(buffer).digest("hex")) throw new Error("Falha na verificação do arquivo gravado.");
      return { result: { path: target, bytes: written.length }, evidence: { type: "file-write", path: target, sha256: checksum, bytes: written.length } };
    }

    case "pointer.click":
    case "pointer.double_click": {
      const x = Number(args.x);
      const y = Number(args.y);
      await clickPointer(x, y, command.action === "pointer.double_click");
      return { result: { x, y }, evidence: await verifyWithScreenshot(command.action, { x, y }) };
    }

    case "pointer.scroll": {
      const delta = Number(args.delta) || -480;
      await scrollPointer(delta);
      return { result: { delta }, evidence: await verifyWithScreenshot("scroll", { delta }) };
    }

    case "keyboard.type": {
      const text = String(args.text ?? "");
      await pasteText(text);
      return { result: { characters: text.length }, evidence: await verifyWithScreenshot("keyboard-type", { characters: text.length }) };
    }

    case "keyboard.shortcut": {
      const keys = Array.isArray(args.keys) ? args.keys.map(String).slice(0, 8) : [];
      await sendShortcut(keys);
      return { result: { keys }, evidence: await verifyWithScreenshot("keyboard-shortcut", { keys }) };
    }

    case "computer.task":
      return runComputerTask(command);

    default:
      throw new Error(`Comando não permitido pelo agente local: ${command.action}`);
  }
}

async function reportResult(
  command: DeviceCommand,
  success: boolean,
  result: unknown,
  evidence: unknown,
  errorMessage?: string,
) {
  await postJson("/api/samuel-desktop/device", {
    action: "result",
    commandId: command.id,
    success,
    verified: success && Boolean(evidence),
    result,
    evidence,
    errorMessage: errorMessage ?? null,
  });
}

async function handleEnvelope(envelope: SignedEnvelope) {
  const command = verifyEnvelope(envelope);
  currentCommandId = command.id;
  stopRequested = false;
  setActivity("Executando", `${command.action} · ${command.id.slice(0, 8)}`);
  audit("command_started", { id: command.id, action: command.action, risk: command.risk });

  try {
    const { result, evidence } = await executeCommand(command);
    await reportResult(command, true, result, evidence);
    setActivity("Conectado", `Concluído e verificado: ${command.action}`);
    audit("command_verified", { id: command.id, action: command.action });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida.";
    try {
      await reportResult(command, false, null, null, message);
    } catch {
      // Keep local audit even if network reporting also failed.
    }
    setActivity("Atenção", `Falha em ${command.action}: ${message}`);
    audit("command_failed", { id: command.id, action: command.action, error: message });
  } finally {
    currentCommandId = null;
    stopRequested = false;
    sendState();
  }
}

async function pollOnce() {
  if (polling) return;
  polling = true;
  try {
    await refreshPairingIfExpired();
    if (!config.deviceId || !deviceToken() || !commandSecret()) await registerDevice();
    await checkPairing();

    if (!config.paired || config.paused || currentCommandId) return;
    const response = await postJson<{ command: SignedEnvelope | null; paused?: boolean }>(
      "/api/samuel-desktop/device",
      { action: "poll" },
    );
    if (response.paused) {
      setActivity("Pausado remotamente", "A fila está suspensa no SF Growth AI");
      return;
    }
    if (response.command) await handleEnvelope(response.command);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de conexão.";
    setActivity("Offline", message);
  } finally {
    polling = false;
    pollTimer = setTimeout(() => void pollOnce(), POLL_MS);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 470,
    height: 690,
    minWidth: 420,
    minHeight: 600,
    backgroundColor: "#05080c",
    title: "Samuel Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  void mainWindow.loadFile(path.join(__dirname, "../src/ui.html"));
  mainWindow.webContents.on("did-finish-load", sendState);
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(`data:image/png;base64,${TRAY_ICON}`).resize({ width: 20, height: 20 });
  tray = new Tray(icon);
  tray.setToolTip("Samuel Desktop · SF Growth AI");
  const rebuild = () => {
    tray?.setContextMenu(
      Menu.buildFromTemplate([
        { label: "Abrir Samuel Desktop", click: () => mainWindow?.show() },
        {
          label: config.paused ? "Retomar execução" : "Pausar execução",
          click: () => {
            config.paused = !config.paused;
            void saveConfig();
            setActivity(config.paused ? "Pausado" : "Conectado", config.paused ? "Execução local pausada" : "Execução local retomada");
            rebuild();
          },
        },
        { label: "STOP SAMUEL", enabled: Boolean(currentCommandId), click: () => { stopRequested = true; setActivity("Interrompendo", "STOP SAMUEL solicitado pelo usuário"); } },
        { type: "separator" },
        { label: "Sair", click: () => { app.isQuiting = true; app.quit(); } },
      ]),
    );
  };
  rebuild();
  tray.on("double-click", () => mainWindow?.show());
}

function registerIpc() {
  ipcMain.handle("samuel:get-state", () => uiState());
  ipcMain.handle("samuel:add-folder", async () => {
    const selection = await dialog.showOpenDialog({
      title: "Autorizar pasta para o Samuel",
      properties: ["openDirectory", "createDirectory"],
    });
    if (selection.canceled || !selection.filePaths[0]) return uiState();
    const folder = path.resolve(selection.filePaths[0]);
    if (!config.allowedFolders.some((item) => path.resolve(item).toLowerCase() === folder.toLowerCase())) {
      config.allowedFolders.push(folder);
      await saveConfig();
      audit("folder_allowed", { folder });
    }
    sendState();
    return uiState();
  });
  ipcMain.handle("samuel:remove-folder", async (_event, folder: string) => {
    config.allowedFolders = config.allowedFolders.filter(
      (item) => path.resolve(item).toLowerCase() !== path.resolve(folder).toLowerCase(),
    );
    await saveConfig();
    audit("folder_revoked", { folder });
    sendState();
    return uiState();
  });
  ipcMain.handle("samuel:set-paused", async (_event, paused: boolean) => {
    config.paused = paused === true;
    await saveConfig();
    setActivity(config.paused ? "Pausado" : "Conectado", config.paused ? "Execução local pausada" : "Execução local retomada");
    return uiState();
  });
  ipcMain.handle("samuel:stop", () => {
    stopRequested = true;
    setActivity("Interrompendo", "STOP SAMUEL solicitado pelo usuário");
    return uiState();
  });
  ipcMain.handle("samuel:new-pairing-code", async () => {
    if (config.paired) return uiState();
    config.deviceId = undefined;
    config.encryptedToken = undefined;
    config.encryptedCommandSecret = undefined;
    config.pairingCode = undefined;
    config.pairingExpiresAt = undefined;
    await saveConfig();
    await registerDevice(true);
    return uiState();
  });
  ipcMain.handle("samuel:open-panel", () => shell.openExternal(`${config.baseUrl}/samuel-ai/desktop`));
}

declare module "electron" {
  interface App {
    isQuiting?: boolean;
  }
}

app.whenReady().then(async () => {
  await loadConfig();
  registerIpc();
  createWindow();
  createTray();

  globalShortcut.register("CommandOrControl+Alt+Escape", () => {
    stopRequested = true;
    setActivity("Interrompendo", "Atalho global STOP SAMUEL acionado");
  });

  app.on("activate", () => {
    if (!mainWindow || mainWindow.isDestroyed()) createWindow();
    mainWindow?.show();
  });

  try {
    await registerDevice();
  } catch (error) {
    setActivity("Offline", error instanceof Error ? error.message : "Falha no registro inicial");
  }
  void pollOnce();
});

app.on("before-quit", () => {
  app.isQuiting = true;
  if (pollTimer) clearTimeout(pollTimer);
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", (event: Event) => {
  event.preventDefault();
});
