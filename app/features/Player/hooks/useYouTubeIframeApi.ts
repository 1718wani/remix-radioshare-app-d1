import { useEffect } from "react";

export const useYoutubeIframeApi = (onApiLoad: () => void) => {
  useEffect(() => {
    const scriptTag = document.createElement("script");
    scriptTag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(scriptTag, firstScriptTag);

    window.onYouTubeIframeAPIReady = onApiLoad;

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [onApiLoad]);
};