export type SamuelSignalPriority = "suggestion" | "update" | "attention" | "critical";

export type SamuelSignal = {
  id: string;
  priority: SamuelSignalPriority;
  title: string;
  message: string;
  createdAt: string;
  source?: string;
  read: boolean;
};

const priorityWeight: Record<SamuelSignalPriority, number> = {
  suggestion: 1,
  update: 2,
  attention: 3,
  critical: 4,
};

export const signalColor: Record<SamuelSignalPriority, "green" | "blue" | "yellow" | "red"> = {
  suggestion: "green",
  update: "blue",
  attention: "yellow",
  critical: "red",
};

export class SamuelProactiveQueue {
  private signals: SamuelSignal[] = [];

  push(input: Omit<SamuelSignal, "id" | "createdAt" | "read">): SamuelSignal {
    const signal: SamuelSignal = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.signals.push(signal);
    return signal;
  }

  pending(): SamuelSignal[] {
    return this.signals
      .filter((signal) => !signal.read)
      .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  next(): SamuelSignal | undefined {
    return this.pending()[0];
  }

  markRead(id: string): void {
    const signal = this.signals.find((item) => item.id === id);
    if (signal) signal.read = true;
  }

  hasSomethingToSay(): boolean {
    return this.pending().length > 0;
  }
}
