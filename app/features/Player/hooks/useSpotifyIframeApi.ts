import { useEffect } from "react";
import { SpotifyIFrameAPI } from "../types/SpotifyIframeApiTypes";

export const useSpotifyIframeApi = (
  onReady: (iframeAPI: SpotifyIFrameAPI) => void
) => {
  useEffect(() => {
    // APIが既にロードされているかチェック
    if (window.Spotify && window.Spotify.Player) {
      onReady(window.Spotify.Player);
      return;
    }

    // グローバル関数を定義
    window.onSpotifyIframeApiReady = (iframeAPI: SpotifyIFrameAPI) => {
      onReady(iframeAPI);
    };

    // スクリプトタグを作成してAPIをロード
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onReady]);
};
