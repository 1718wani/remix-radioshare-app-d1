/// <reference types="youtube" />

import {
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { useYoutubeIframeApi } from "../hooks/useYouTubeIframeApi";
import { YoutubeIFrameAPIOptions } from "../types/YoutubeIframeApiTypes";
import { useAtom } from "jotai";
import { youtubeEmbedRefAtom } from "../atoms/youtubeEmbedRefAtom";


export const YoutubePlayer = forwardRef<YT.Player, YoutubeIFrameAPIOptions>(
  (
    {
      initialVideoId,
      width = "full",
      height = "20%",
    }: YoutubeIFrameAPIOptions,
  ) => {
    YoutubePlayer.displayName = "YoutubePlayer";
    // YouTube プレイヤーが埋め込まれる <div> 要素への参照を保持
    const playerRef = useRef<HTMLDivElement>(null);
    // YouTube プレイヤーのインスタンス自体
    const player = useRef<YT.Player | null>(null);
    const [, setYoutubeEmbedRef] = useAtom(youtubeEmbedRefAtom);

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
                setYoutubeEmbedRef(player)
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
