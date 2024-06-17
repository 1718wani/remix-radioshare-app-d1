import { useState, useEffect, useRef, useCallback } from "react";
import { SpotifyEmbedController } from "~/features/Player/types/SpotifyIframeApiTypes";

export function useSpotifyPlayer(onPlaybackEnd: () => void) {
  const [spotifyController, setSpotifyController] =
    useState<SpotifyEmbedController | null>(null);
  const stopAtRef = useRef<number | null>(null);

  const callback = useCallback(
    (controller: SpotifyEmbedController) => {
      setSpotifyController(controller);

      controller.addListener("ready", () => {
        console.log("Spotify IframeAPI ready");
      });

      controller.addListener("playback_update", (e) => {
        console.log(
          "Playback update received:",
          e?.data.position || 0 / 1000,
          stopAtRef.current
        );
        if (
          stopAtRef.current !== null &&
          e &&
          e.data.position / 1000 >= stopAtRef.current
        ) {
          console.log("Playback end", e.data.position, stopAtRef.current);
          controller.pause();
          stopAtRef.current = null; // stopAtRefを更新
          onPlaybackEnd();
        }
      });
    },
    [onPlaybackEnd]
  );

  useEffect(() => {
    if (spotifyController) {
      return;
    }

    const node = document.getElementById("spotify-player");
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById("spotify-iframe");
      const options = {
        uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
        width: 0,
        height: 0,
        onStop: () => {
          console.log("Playback end");
          onPlaybackEnd();
        },
      };

      if (element) {
        IFrameAPI.createController(element, options, callback);
      }
    };

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }, [onPlaybackEnd, callback, spotifyController]);

  const playSpotifyHighlight = (
    idOrUri: string,
    convertedStartSeconds: number,
    convertedEndSeconds: number
  ) => {
    if (spotifyController) {
      spotifyController.setIframeDimensions(320, 160);
      spotifyController.play();
      spotifyController.loadUri(idOrUri, false, convertedStartSeconds);
      setTimeout(() => {
        spotifyController.play();
        stopAtRef.current = convertedEndSeconds;
      }, 800);
    }
  };

  const pauseSpotifyHighlight = () => {
    if (spotifyController) {
      spotifyController.pause();
      spotifyController.setIframeDimensions(0, 0);
    }
  };

  return { playSpotifyHighlight, pauseSpotifyHighlight };
}
