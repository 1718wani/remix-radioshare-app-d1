/// <reference types="youtube" />

// components/YoutubePlayer.tsx
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
    const playerRef = useRef<HTMLDivElement>(null);
    const player = useRef<YT.Player | null>(null);
    const [, setYoutubeEmbedRef] = useAtom(youtubeEmbedRefAtom);

    useYoutubeIframeApi(() => {
      if (playerRef.current) {
        player.current = new YT.Player(playerRef.current, {
          width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
          height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
          videoId: initialVideoId, 
          events: {
            onReady: () => {
              if (player.current) {
                console.log("onReadyですよ");
                setYoutubeEmbedRef(player)
              }
            },
            // その他のイベントハンドラー
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
