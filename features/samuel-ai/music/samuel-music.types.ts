export type SamuelMusicAction =
  | "play"
  | "pause"
  | "resume"
  | "stop"
  | "next"
  | "previous"
  | "set_volume"
  | "volume_up"
  | "volume_down";

export type SamuelMusicCommand = {
  action: SamuelMusicAction;
  query?: string;
  volume?: number;
};

export type SamuelMusicTrack = {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  artworkUrl?: string | null;
  previewUrl: string;
  externalUrl?: string | null;
};

export type SamuelMusicSearchResponse = {
  tracks: SamuelMusicTrack[];
  provider: "itunes-preview";
  limitation: string;
};
