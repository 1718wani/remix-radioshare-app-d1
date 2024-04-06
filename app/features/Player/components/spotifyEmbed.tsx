import { forwardRef, useState } from "react";
import { useSpotifyIframeApi } from "../hooks/useSpotifyIframeApi";

type Episode = {
  uri: string;
  startTime: number;
  stopAfter: number;
};

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
          playEpisodes: (episodes: Episode[], currentIndex: number = 0) => {
            if (currentIndex >= episodes.length) return; // 全てのエピソードが再生されたら終了
        
            const { uri, startTime, stopAfter } = episodes[currentIndex];
            EmbedController.loadUri(uri);
            EmbedController.play();
            setTimeout(() => {
              EmbedController.seek(startTime);
              setTimeout(() => {
                EmbedController.pause();
                // 次のエピソードがあれば再生
                if (currentIndex + 1 < episodes.length) {
                  ref?.current.playEpisodes(episodes, currentIndex + 1);
                }
              }, stopAfter);
            }, 700); // エピソードが再生を開始してからシークするまでの待機時間
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
