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
    const [stopPosition, setStopPosition] = useState<number | undefined>(undefined);
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
                console.log("playback_update",e)
              
                // console.log(e.data.position, "position");
                // console.log(e.data.isBuffering, "buffer");
                // console.log(e.data.isPaused, "isPaused");
                // console.log(e.data.duration, "duration");
                if (e.data.position > 1000) {
                  player.current?.pause();
                }

                if (e.data.isPaused && e.data.position > 0) {
                  onStop();
                }
  
              }
            });
          }
        );
      }
    });

    return <div ref={playerRef} />;
  }
);
