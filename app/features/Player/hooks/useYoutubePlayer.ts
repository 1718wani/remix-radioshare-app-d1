/// <reference types="youtube" />

import { useState, useEffect, useCallback, useRef } from "react";

export function useYouTubePlayer(onStopCallback: () => void) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const hasEndedRef = useRef(false); // フラグを追加

  const onPlayerReady = (event: YT.PlayerEvent) => {
    console.log("onPlayerReady", event);
  };

  const onPlayerStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.ENDED && !hasEndedRef.current) {
        hasEndedRef.current = true; // フラグをセット
        onStopCallback();
        setTimeout(() => {
          hasEndedRef.current = false; // 少し遅延させてフラグをリセット
        }, 100); // 100msの遅延を追加
      }
    },
    [onStopCallback]
  );

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new YT.Player("youtube-iframe", {
        height: "0",
        width: "0",
        videoId: "",
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
      setPlayer(newPlayer);
    };

    return () => {
      // スクリプトが追加されたのと同じ親ノードから削除します
      firstScriptTag.parentNode?.removeChild(tag);
    };
  }, [onPlayerStateChange]);

  const playYoutubeHighlight = (
    idOrUri: string,
    convertedStartSeconds: number,
    convertedEndSeconds: number 
  ) => {
    if (player) {
      player.setSize(320, 160);
      player.loadVideoById({
        videoId: idOrUri,
        startSeconds: convertedStartSeconds,
        endSeconds: convertedEndSeconds,
        suggestedQuality: "small",
      });
    }
  };

  const pauseYoutubeHighlight = () => {
    if (player) {
      player.setSize(0, 0);
      player.stopVideo();
    }
  };

  return {
    playYoutubeHighlight,
    pauseYoutubeHighlight,
  };
}
