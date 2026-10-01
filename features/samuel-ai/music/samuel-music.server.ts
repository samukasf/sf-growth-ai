import type { SamuelMusicCommand } from "./samuel-music.types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clampVolume(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function parseSamuelMusicCommand(input: string): SamuelMusicCommand | null {
  const text = normalize(input);
  if (!text) return null;

  if (/\b(pause|pausa|pause a musica|pausa a musica|pausar musica)\b/.test(text)) {
    return { action: "pause" };
  }
  if (/\b(continue|continua|continuar|retome|retoma|retomar|resume|volta a tocar)\b/.test(text)) {
    return { action: "resume" };
  }
  if (/\b(pare a musica|para a musica|parar a musica|desliga a musica|desligue a musica|stop music)\b/.test(text)) {
    return { action: "stop" };
  }
  if (/\b(proxima|proxima musica|proxima faixa|next|pula essa|pule essa)\b/.test(text)) {
    return { action: "next" };
  }
  if (/\b(anterior|musica anterior|faixa anterior|volta a musica|previous)\b/.test(text)) {
    return { action: "previous" };
  }
  if (/\b(aumenta|aumente|suba|sobe) (?:o )?volume\b/.test(text)) {
    return { action: "volume_up" };
  }
  if (/\b(abaixa|abaixe|diminui|diminua|desce) (?:o )?volume\b/.test(text)) {
    return { action: "volume_down" };
  }

  const volumeMatch = text.match(
    /\b(?:volume|coloca(?:r)? o volume|deixa(?:r)? o volume)\s+(?:em\s+)?(\d{1,3})\b/,
  );
  if (volumeMatch?.[1]) {
    return { action: "set_volume", volume: clampVolume(Number(volumeMatch[1])) };
  }

  const playMatch = text.match(
    /^(?:samuel[ ,:-]*)?(?:toque|toca|tocar|coloque|coloca|ponha|poe|bota|reproduza|reproduzir|play)\s+(?:a musica\s+|a faixa\s+|musica\s+|faixa\s+)?(.+)$/i,
  );
  if (playMatch?.[1]) {
    const query = playMatch[1]
      .replace(/\b(?:por favor|pra mim|para mim|agora)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (query.length >= 2) return { action: "play", query };
  }

  return null;
}

export function musicCommandFragment(command: SamuelMusicCommand) {
  if (command.action === "play") {
    return `[MÚSICA — COMANDO LOCAL] Reproduzir: ${command.query}. O navegador executará o player e confirmará visualmente; não afirme reprodução concluída sem o estado do player.`;
  }
  if (command.action === "set_volume") {
    return `[MÚSICA — COMANDO LOCAL] Ajustar volume para ${command.volume}%. O navegador executará o player.`;
  }
  return `[MÚSICA — COMANDO LOCAL] Ação: ${command.action}. O navegador executará o player; responda de forma breve.`;
}


export function musicCommandAcknowledgement(command: SamuelMusicCommand) {
  switch (command.action) {
    case "play":
      return command.query
        ? `Certo. Vou colocar ${command.query}.`
        : "Certo. Vou colocar a música.";
    case "pause":
      return "Certo. Pausando.";
    case "resume":
      return "Continuando.";
    case "stop":
      return "Música encerrada.";
    case "next":
      return "Próxima faixa.";
    case "previous":
      return "Voltando uma faixa.";
    case "set_volume":
      return `Volume em ${command.volume ?? 70}%.`;
    case "volume_up":
      return "Aumentando o volume.";
    case "volume_down":
      return "Baixando o volume.";
  }
}
