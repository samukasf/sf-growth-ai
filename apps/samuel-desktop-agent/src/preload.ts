import { contextBridge, ipcRenderer } from "electron";

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

contextBridge.exposeInMainWorld("samuelDesktop", {
  getState: (): Promise<UiState> => ipcRenderer.invoke("samuel:get-state"),
  addFolder: (): Promise<UiState> => ipcRenderer.invoke("samuel:add-folder"),
  removeFolder: (folder: string): Promise<UiState> => ipcRenderer.invoke("samuel:remove-folder", folder),
  setPaused: (paused: boolean): Promise<UiState> => ipcRenderer.invoke("samuel:set-paused", paused),
  stop: (): Promise<UiState> => ipcRenderer.invoke("samuel:stop"),
  newPairingCode: (): Promise<UiState> => ipcRenderer.invoke("samuel:new-pairing-code"),
  openPanel: (): Promise<void> => ipcRenderer.invoke("samuel:open-panel"),
  onState: (callback: (state: UiState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: UiState) => callback(state);
    ipcRenderer.on("samuel:state", listener);
    return () => ipcRenderer.removeListener("samuel:state", listener);
  },
});
