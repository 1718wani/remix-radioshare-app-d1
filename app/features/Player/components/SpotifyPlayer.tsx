import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  SpotifyEmbedController,
  SpotifyIFrameAPI,
  SpotifyIFrameAPIOptions,
} from "../types/SpotifyIframeApiTypes";
import { useSpotifyIframeApi } from "../hooks/useSpotifyIframeApi";

export const SpotifyPlayer = forwardRef(
  ({ uri, width, height = "75%" }: SpotifyIFrameAPIOptions, ref) => {
    SpotifyPlayer.displayName = "SpotifyPlayer";

    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<SpotifyEmbedController | null>(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isPaused, setIsPaused] = useState(true);

    useSpotifyIframeApi((spotifyIframeApi: SpotifyIFrameAPI) => {
      if (containerRef.current) {
        spotifyIframeApi.createController(
          containerRef.current,
          {
            uri, // プロパティから受け取ったURIを使用
            width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
            height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
          },
          (embedController: SpotifyEmbedController) => {
            mapRef.current = embedController;

            // playback_updateイベントにリスナーを登録
            embedController.addListener("playback_update", (e) => {
              if (e) {
                console.log(e.data.position, "position");
                console.log(e.data.isBuffering, "buffer");
                console.log(e.data.isPaused, "isPaused");
                console.log(e.data.duration, "duration");
                setIsBuffering(e.data.isBuffering);
                setIsPaused(e.data.isPaused);
              }
            });
          }
        );
      }
    });

    useImperativeHandle(ref, () => ({
      play: () => {
        mapRef.current?.play();
      },
      seek: (seconds: number) => {
        mapRef.current?.play();
        setTimeout(() => {
          mapRef.current?.seek(seconds);
        }, 150); // 0.5秒後にseekを実行
      },
      stop: () => {
        if (!isPaused) {
          mapRef.current?.togglePlay();
        }
      },
    }));

    // バッファリング状態に基づいて何かアクションを実行する例
    useEffect(() => {
      if (isBuffering) {
        console.log("バッファリング中...");
      } else {
        console.log("バッファリング完了");
      }
    }, [isBuffering]);

    return <div ref={containerRef} />;
  }
);
