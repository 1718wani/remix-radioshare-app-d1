import { useEffect } from "react";

export const useSpotifyIframeApi = (onReady) => {
  useEffect(() => {
    // APIが既にロードされているかチェック
    if (window.Spotify && window.Spotify.Player) {
      onReady(window.Spotify.Player);
      return;
    }

    // グローバル関数を定義
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      onReady(IFrameAPI);
    };

    // スクリプトタグを作成してAPIをロード
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  

    return () => {
      document.body.removeChild(script);
    };
  }, [onReady]);
};
