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
          playAtSpecificTime: (time, newUri, stopAfter, nextTime, nextUri) => {
            console.log(newUri, "newuri");
            EmbedController.loadUri(newUri);
            EmbedController.play();
            setTimeout(() => {
              EmbedController.seek(time);
              // 指定した時間後に停止し、次のエピソードを再生する
              if (stopAfter && nextUri) {
                setTimeout(() => {
                  EmbedController.pause();
                  // 次のエピソードを再生
                  EmbedController.loadUri(nextUri);
                  EmbedController.play();
                  if (nextTime) {
                    setTimeout(() => {
                      EmbedController.seek(nextTime);
                    }, 700); // 次のエピソードが再生を開始してからシークするまでの待機時間
                  }
                }, stopAfter);
              }
            }, 700);
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
