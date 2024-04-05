import { forwardRef, useState } from "react";
import { useSpotifyIframeApi } from "../hooks/useSpotifyIframeApi";

export const SpotifyEmbed = forwardRef(
  ({ uri, width = "full", height = "10%" }, ref) => {
    SpotifyEmbed.displayName = "SpotifyEmbed";
    const [embedController, setEmbedController] = useState(null);

    useSpotifyIframeApi((IFrameAPI) => {
      const element = document.getElementById("spotify-embed");
      if (!element) return;

      const options = { uri, width, height };
      const callback = (EmbedController) => {
        setEmbedController(EmbedController);
        // ref.current に EmbedController のメソッドを設定する
        ref.current = {
          playAtSpecificTime: (time, newUri) => {
            // 新しいURIが指定されている場合は、loadUriを呼び出してからplayを実行
            console.log(newUri,"newuri")
            EmbedController.loadUri(newUri)
            EmbedController.play();
            setTimeout(() => {
              EmbedController.seek(time);
            }, 100);
            
          },
          togglePlay: () => {
            EmbedController.togglePlay();
          },
        };
      };

      IFrameAPI.createController(element, options, callback);
    });

    return (
      <>
        <div id="spotify-embed"></div>
      </>
    );
  }
);
