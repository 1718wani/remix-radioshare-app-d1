// import { forwardRef, useEffect, useRef, useState } from "react";
// import {
//   SpotifyEmbedController,
//   SpotifyIFrameAPI,
//   SpotifyIFrameAPIOptions,
// } from "../types/SpotifyIframeApiTypes";
// import { useSpotifyIframeApi } from "../hooks/useSpotifyIframeApi";
// import { useAtom } from "jotai";
// import { spotifyPlayerAtom } from "../atoms/spotifyEmbedRefAtom";

// export const SpotifyPlayer = forwardRef(
//   (
//     { uri, width = 0, height = 0, endTime, onStop }: SpotifyIFrameAPIOptions,
//     ref
//   ) => {
//     SpotifyPlayer.displayName = "SpotifyPlayer";

//     const playerRef = useRef<HTMLDivElement>(null);
//     const player = useRef<SpotifyEmbedController | null>(null);
//     console.log(endTime, "endTimePlayerの外");

//     const [, setSpotifyPlayer] = useAtom(spotifyPlayerAtom);

//     useSpotifyIframeApi((spotifyIframeApi: SpotifyIFrameAPI) => {
//       if (playerRef.current) {
//         spotifyIframeApi.createController(
//           playerRef.current,
//           {
//             uri, // プロパティから受け取ったURIを使用
//             width: typeof width === "number" ? `${width}px` : width, // 数値の場合はpxを付ける
//             height: typeof height === "number" ? `${height}px` : height, // 数値の場合はpxを付ける
//             onStop,
//           },
//           (embedController: SpotifyEmbedController) => {
//             player.current = embedController;

//             embedController.addListener("ready", () => {
//               if (player.current) {
//                 console.log("ready", embedController);
//                 setSpotifyPlayer(player);
//               }
//             });
//           }
//         );
//       }
//     });

//     useEffect(() => {
//       const currentPlayer = player.current;
//       if (currentPlayer) {
//         const handlePlaybackUpdate = (e) => {
//           if (e && endTime > 0 && e.data.position / 1000 > endTime) {
//             console.log("Playback should stop");
    
//             currentPlayer.pause();
//             onStop();
//           }
//         };

//         currentPlayer.addListener("playback_update", handlePlaybackUpdate);

//         return () => {
//           currentPlayer.removeListener("playback_update", handlePlaybackUpdate);
//         };
//       }
//     }, [endTime, onStop]);

//     return <div ref={playerRef} />;
//   }
// );
