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

     // MutationObserverを設定してiframeの挿入を監視
     const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            const iframe = node as HTMLIFrameElement;
            // allow属性を設定
            iframe.setAttribute('allow', 'encrypted-media');
          }
        });
      });
    });

    // ドキュメント全体を監視対象とする
    observer.observe(document.body, { childList: true, subtree: true });


    // 既にスクリプトが追加されているかチェックする
    const spotifyScript = document.getElementById('spotify-iframeapi-script');
    if(spotifyScript) return;

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
