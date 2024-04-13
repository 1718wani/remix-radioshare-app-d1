// components/YoutubePlayer.tsx
import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useYoutubeIframeApi } from "../hooks/useYouTubeIframeApi";
import { YoutubeIFrameAPIOptions } from "../types/YoutubeIframeApiTypes";

export const YoutubePlayer = forwardRef(
  (
    {
      initialVideoId,
      initialStartSeconds = 0,
      width = 0,
      height = 0,
    }: YoutubeIFrameAPIOptions,
    ref
  ) => {
    YoutubePlayer.displayName = "YoutubePlayer";
    const playerRef = useRef<HTMLDivElement>(null);
    const player = useRef<YouTubePlayer | null>(null);

    useYoutubeIframeApi(() => {
      if (playerRef.current && !player.current) {
        player.current = new YT.Player(playerRef.current, {
          width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
          height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
          initialVideoId,
          events: {
            onReady: () => {
              if (player.current) {
                player.current.seekTo(initialStartSeconds, true);
              }
            },
            // その他のイベントハンドラー
          },
        });
      }
    });

    useImperativeHandle(ref, () => ({
      play: () => {
        player.current?.playVideo();
      },
      stop: () => {
        player.current?.stopVideo();
      },
      changeVideo: (newVideoId: string, newStartSeconds: number) => {
        if (player.current) {
          player.current.loadVideoById({
            videoId: newVideoId,
            startSeconds: newStartSeconds,
          });
        }
        
      },
    }));

    // useEffect(() => {
    //   if (player.current) {
    //     console.log("effect")
    //     player.current.loadVideoById(videoId);
    //     player.current.seekTo(startSeconds, true);
    //   }
    // }, [videoId, startSeconds]);

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
        style={{ borderRadius: "10px", overflow: "hidden" ,display:"none"}}
      />
    );
  }
);
