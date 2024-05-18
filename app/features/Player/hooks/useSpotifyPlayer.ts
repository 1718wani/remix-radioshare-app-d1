import { useState, useEffect, useRef } from "react";
import { SpotifyEmbedController } from "~/features/Player/types/SpotifyIframeApiTypes";

export function useSpotifyPlayer(onPlaybackEnd: () => void) {
  const [spotifyController, setSpotifyController] =
    useState<SpotifyEmbedController | null>(null);
  const stopAtRef = useRef<number | null>(null);

  useEffect(() => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById("embed-iframe");
      const options = {
        uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
        width: 0,
        height: 0,
      };
      const callback = (controller: SpotifyEmbedController) => {
        setSpotifyController(controller);

        controller.addListener("ready", () => {
          console.log("Spotify IframeAPI ready");
        });

        controller.addListener("playback_update", (e) => {
          console.log(
            "Playback update received:",
            e?.data.position / 1000,
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
      document.body.removeChild(script);
    };
  }, [onPlaybackEnd]);

  const playSpotifyHighlight = (
    idOrUri: string,
    convertedStartSeconds: number,
    convertedEndSeconds: number
  ) => {
    console.log("playSpotifyHighlight", convertedEndSeconds);
    if (spotifyController) {
      spotifyController.setIframeDimensions(320, 80);
      spotifyController.loadUri(idOrUri, false, convertedStartSeconds);
      spotifyController.play();
      stopAtRef.current = convertedEndSeconds; // stopAtRefを更新
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
