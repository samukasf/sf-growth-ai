export function splitNarrationText(text: string, maxChars = 2_200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    if (sentence.length <= maxChars) {
      current = sentence;
      continue;
    }
    for (let offset = 0; offset < sentence.length; offset += maxChars) {
      const piece = sentence.slice(offset, offset + maxChars).trim();
      if (piece) chunks.push(piece);
    }
    current = "";
  }
  if (current) chunks.push(current);
  return chunks;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}

function audioBufferToWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frameCount = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataLength = frameCount * blockAlign;
  const output = new ArrayBuffer(44 + dataLength);
  const view = new DataView(output);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const value = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] ?? 0));
      view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([output], { type: "audio/wav" });
}

export async function mergeNarrationAudio(blobs: Blob[]) {
  if (!blobs.length) throw new Error("Nenhum trecho de narração foi gerado.");
  const context = new AudioContext({ sampleRate: 44_100 });
  try {
    const decoded: AudioBuffer[] = [];
    for (const blob of blobs) {
      const bytes = await blob.arrayBuffer();
      decoded.push(await context.decodeAudioData(bytes.slice(0)));
    }
    const channels = Math.max(1, ...decoded.map((buffer) => buffer.numberOfChannels));
    const totalLength = decoded.reduce((sum, buffer) => sum + buffer.length, 0);
    const merged = context.createBuffer(channels, totalLength, context.sampleRate);
    let cursor = 0;
    for (const buffer of decoded) {
      for (let channel = 0; channel < channels; channel += 1) {
        const source = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
        merged.getChannelData(channel).set(source, cursor);
      }
      cursor += buffer.length;
    }
    return audioBufferToWav(merged);
  } finally {
    await context.close();
  }
}
