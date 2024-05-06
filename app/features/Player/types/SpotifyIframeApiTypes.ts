export interface SpotifyIFrameAPIOptions {
  uri?: string | string;
  width?: number | string;
  height?: number | string;
  onStop: () => void;
}

export interface PlaybackState {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
  };
}

export interface SpotifyIFrameAPI {
  createController(
    element: HTMLElement,
    options: SpotifyIFrameAPIOptions,
    callback: (embedController: SpotifyEmbedController) => void
  ): void;
}

export interface SpotifyEmbedController {
  loadUri(spotifyUri: string ,preferVideo:boolean, timestampInSeconds:number ): void;
  play(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  destroy(): void;
  addListener(
    event: "ready" | "playback_update",
    callback: (state?: PlaybackState) => void
  ): void;
}

// SpotifyPlayerからのメソッドを含む型を定義
export interface SpotifyPlayerRef {
  stop: () => void;
  playEpisode: (uri: string, seekSeconds: number,endSeconds:number) => void;
  setIframeDimensions: (width: number, height: number) => void;  
}

declare global {
  interface Window {
    Spotify?: {
      Player: SpotifyIFrameAPI;
    };
    onSpotifyIframeApiReady?: (iframeAPI: SpotifyIFrameAPI) => void;
  }
}
