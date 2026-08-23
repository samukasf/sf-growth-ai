export type LiveToolDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type LiveSessionConfig = {
  systemInstruction: string;
  voice?: string;
  language?: string;
  tools?: LiveToolDeclaration[];
};

export type LiveToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type LiveEvent =
  | { type: "audio"; data: string; mimeType: string }
  | { type: "transcript"; text: string; final: boolean }
  | { type: "tool_call"; call: LiveToolCall }
  | { type: "interrupted" }
  | { type: "error"; message: string };

export interface SamuelLiveProvider {
  readonly name: string;
  connect(config: LiveSessionConfig): Promise<void>;
  sendAudio(audio: ArrayBuffer): Promise<void>;
  sendText(text: string): Promise<void>;
  sendToolResult(callId: string, result: unknown): Promise<void>;
  events(): AsyncIterable<LiveEvent>;
  close(): Promise<void>;
}
