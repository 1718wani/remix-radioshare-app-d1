import { useState, useEffect } from "react";
import { SpotifyEmbedController } from "~/features/Player/types/SpotifyIframeApiTypes";

export function useSpotifyPlayer() {
  const [spotifyController, setSpotifyController] =
    useState<SpotifyEmbedController | null>(null);

  useEffect(() => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById("embed-iframe");
      const options = {
        uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
      };
      const callback = (controller: SpotifyEmbedController) => {
        setSpotifyController(controller);
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
  }, []);

  return spotifyController;
}
