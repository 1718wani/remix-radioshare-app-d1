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
  addListener: (eventName: string, handler: (e: PlaybackState) => void) => void;
  currentUri: string;
  destroy: () => void;
  emitEvent: (eventName: string, eventData: PlaybackState) => void;
  flushCommandQ: () => void;
  host: string;
  iframeElement: HTMLIFrameElement;
  loadUri: (
    uriString: string,
    preferVideo?: boolean,
    timestampInSeconds?: number
  ) => void;
  loading: boolean;
  off: (eventName: string, handler: (e: PlaybackState) => void) => void;
  on: (eventName: string, handler: (e: PlaybackState) => void) => void;
  onPlaybackUpdate: (playbackState: PlaybackState) => void;
  onPlayerReady: () => void;
  onWindowMessages: (e: unknown) => void;
  once: (eventName: string, handler: (e: PlaybackState) => void) => void;
  options: { uri: string; width: number; height: number };
  pause: () => void;
  play: () => void;
  playFromStart: () => void;
  playerReadyAck: () => void;
  queryParamReferer: undefined;
  removeListener: (eventName: string, handler: (e: PlaybackState) => void) => void;
  restart: () => void;
  resume: () => void;
  seek: (timestampInSeconds: number) => void;
  sendMessageToEmbed: (messageToSend: unknown) => void;
  setIframeDimensions: (width: number, height: number) => void;
  togglePlay: () => void;
  _commandQ: unknown[];
  _listeners: {
    ready: ((e: unknown) => void)[];
    playback_update: ((e: unknown) => void)[];
    error: ((e: unknown) => void)[];
  };
}

// SpotifyPlayerからのメソッドを含む型を定義
export interface SpotifyPlayerRef {
  stop: () => void;
  playEpisode: (uri: string, seekSeconds: number, endSeconds: number) => void;
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
