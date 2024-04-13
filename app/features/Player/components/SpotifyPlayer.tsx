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
  ({ uri, width = "full", height = "20%",onStop }: SpotifyIFrameAPIOptions, ref) => {
    SpotifyPlayer.displayName = "SpotifyPlayer";

    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<SpotifyEmbedController | null>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [endSeconds, setEndSeconds] = useState(0);
    const [nowSeconds, setNowSeconds] = useState(0);

    useSpotifyIframeApi((spotifyIframeApi: SpotifyIFrameAPI) => {
      if (containerRef.current) {
        spotifyIframeApi.createController(
          containerRef.current,
          {
            uri, // プロパティから受け取ったURIを使用
            width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
            height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
            onStop
          },
          (embedController: SpotifyEmbedController) => {
            mapRef.current = embedController;

            embedController.addListener("ready", () => {
              console.log("ready");
            });

            // playback_updateイベントにリスナーを登録
            embedController.addListener("playback_update", (e) => {
              if (e) {
                // console.log(e.data.position, "position");
                // console.log(e.data.isBuffering, "buffer");
                // console.log(e.data.isPaused, "isPaused");
                // console.log(e.data.duration, "duration");
                setNowSeconds(e.data.position / 1000);
                setIsPaused(e.data.isPaused);
              }
            });
          }
        );
      }
    });

    useImperativeHandle(ref, () => ({
      stop: () => {
        if (!isPaused) {
          mapRef.current?.togglePlay();
        }
      },
      playEpisode: async (uri: string, startSeconds: number,endSeconds :number) => {
        mapRef.current?.loadUri(uri);
        // 
        mapRef.current?.play();
        setTimeout(() => {
          mapRef.current?.seek(startSeconds);
        }, 700); // 0.7秒後にseekを実行しないと特定時間から再生されない
        setEndSeconds(endSeconds)
      },
    }));

    useEffect(() => {
      if (nowSeconds >= endSeconds && !isPaused) {
        mapRef.current?.togglePlay();
        if (onStop) {
          onStop(); // コールバックを呼び出す
        }
      }
    }, [nowSeconds, isPaused, endSeconds,onStop]);

    return <div ref={containerRef} />;
  }
);
