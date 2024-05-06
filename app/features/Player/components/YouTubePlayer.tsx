/// <reference types="youtube" />

import {
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { YoutubeIFrameAPIOptions } from "../types/YoutubeIframeApiTypes";
import { useAtom } from "jotai";
import { useYoutubeIframeApi } from "../hooks/useYouTubeIframeApi";
import { youtubePlayerAtom } from "../atoms/youtubeEmbedRefAtom";


export const YoutubePlayer = forwardRef<YT.Player, YoutubeIFrameAPIOptions>(
  (
    {
      initialVideoId,
      width = 0,
      height = 0,
      onStop, 
    }: YoutubeIFrameAPIOptions,
  ) => {
    YoutubePlayer.displayName = "YoutubePlayer";
    // YouTube プレイヤーが埋め込まれる <div> 要素への参照を保持
    const playerRef = useRef<HTMLDivElement>(null);
    // YouTube プレイヤーのインスタンス自体
    const player = useRef<YT.Player | null>(null);
    const [, setYoutubePlayer] = useAtom(youtubePlayerAtom);

    useYoutubeIframeApi(() => {
      if (playerRef.current) {
        player.current = new YT.Player(playerRef.current, {
          width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
          height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
          videoId: initialVideoId, // Correct property name
          events: {
            onReady: () => {
              if (player.current) {
                console.log("Youtube Iframe onReady",player);
                setYoutubePlayer(player)
              }
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED  ) {
                console.log("Youtube Iframe onStateChange stopなんだよね", event.data);
                onStop();  // ビデオが終了したときに onStop を呼び出す
              }
            },
          },
        });
      }
    });

    useEffect(() => {
      return () => {
        if (player.current) {
          player.current.destroy();
        }
      };
    }, []);

    return (
      <div
        ref={playerRef}
        style={{ borderRadius: "10px", overflow: "hidden" }}
      />
    );
  }
);