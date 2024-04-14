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
import { useAtom } from "jotai";
import { spotifyEmbedRefAtom } from "../atoms/spotifyEmbedRefAtom";

export const SpotifyPlayer = forwardRef(
  ({ uri, width = "full", height = "20%",onStop }: SpotifyIFrameAPIOptions, ref) => {
    SpotifyPlayer.displayName = "SpotifyPlayer";

    // Spotify プレイヤーが埋め込まれる <div> 要素への参照を保持
    const playerRef = useRef<HTMLDivElement>(null);
    // Spotify プレイヤーのインスタンス自体
    const player = useRef<SpotifyEmbedController | null>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [endSeconds, setEndSeconds] = useState(0);
    const [nowSeconds, setNowSeconds] = useState(0);
    const [, setSpotifyEmbedRef] = useAtom(spotifyEmbedRefAtom);

    useSpotifyIframeApi((spotifyIframeApi: SpotifyIFrameAPI) => {
      if (playerRef.current) {
        spotifyIframeApi.createController(
          playerRef.current,
          {
            uri, // プロパティから受け取ったURIを使用
            width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
            height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
            onStop
          },
          (embedController: SpotifyEmbedController) => {
            player.current = embedController;
            console.log(embedController,"embedController")

            embedController.addListener("ready", () => {
              console.log("Spotify IframeAPI ready");
              console.log("player.current",player.current)
              setSpotifyEmbedRef(player)
            });


            // playback_updateイベントにリスナーを登録
            embedController.addListener("playback_update", (e) => {
              if (e) {
                console.log("playback_update")
                // console.log(e.data.position, "position");
                // console.log(e.data.isBuffering, "buffer");
                // console.log(e.data.isPaused, "isPaused");
                // console.log(e.data.duration, "duration");
                
  
              }
            });
          }
        );
      }
    });

    useImperativeHandle(ref, () => ({
      stop: () => {
          player.current?.pause();
      },
      playEpisode: async (uri: string, startSeconds: number,endSeconds :number) => {
        player.current?.loadUri(uri);
        // 
        player.current?.play();
        setTimeout(() => {
          player.current?.seek(startSeconds);
        }, 700); // 0.7秒後にseekを実行しないと特定時間から再生されない
        setEndSeconds(endSeconds)
      },
    }));

    useEffect(() => {
      if (nowSeconds >= endSeconds && !isPaused) {
        player.current?.togglePlay();
        if (onStop) {
          onStop(); // コールバックを呼び出す
        }
      }
    }, [nowSeconds, isPaused, endSeconds,onStop]);

    return <div ref={playerRef} />;
  }
);
