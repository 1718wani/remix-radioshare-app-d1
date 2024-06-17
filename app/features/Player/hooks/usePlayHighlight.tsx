import { useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";
import { convertUrlToId } from "~/features/Player/functions/convertUrlToId";
import { useSpotifyPlayer } from "~/features/Player/hooks/useSpotifyPlayer";
import { useYouTubePlayer } from "./useYoutubePlayer";
import { highlightCardWithRadioshowProps } from "~/features/Highlight/types/highlightCardWithRadioshowProps";

export function usePlayHighlight(onPlaybackEnd: () => void) {
  const { playSpotifyHighlight, pauseSpotifyHighlight } = useSpotifyPlayer(onPlaybackEnd);
  const { playYoutubeHighlight, pauseYoutubeHighlight } = useYouTubePlayer(onPlaybackEnd);

  const playHighlight = useCallback(
    (highlightData:highlightCardWithRadioshowProps["highlightData"] ) => {
      const { platform, idOrUri } = convertUrlToId(highlightData.highlight.replayUrl);
      const convertedStartSeconds = convertHHMMSSToSeconds(highlightData.highlight.startHHmmss);
      const convertedEndSeconds = convertHHMMSSToSeconds(highlightData.highlight.endHHmmss);

      if (!idOrUri) {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "再生エラーです",
          message: "登録されたURIの不備です",
          color: "red",
          icon: <IconX />,
        });
        return;
      }

      if (
        convertedStartSeconds !== undefined &&
        convertedEndSeconds !== undefined &&
        convertedStartSeconds >= 0 &&
        convertedEndSeconds >= 0 &&
        platform
      ) {
        if (platform === "spotify") {
          pauseYoutubeHighlight();
          playSpotifyHighlight(idOrUri, convertedStartSeconds, convertedEndSeconds);
        } else {
          pauseSpotifyHighlight();
          playYoutubeHighlight(idOrUri, convertedStartSeconds, convertedEndSeconds);
        }
      } else {
        console.log("何も再生しない");
      }
    },
    [playSpotifyHighlight, playYoutubeHighlight, pauseSpotifyHighlight, pauseYoutubeHighlight]
  );

  return { playHighlight, pauseSpotifyHighlight, pauseYoutubeHighlight };
}