import { useCallback, useEffect, useRef, useState } from "react";
import type { SpotifyEmbedController } from "~/features/Player/types/SpotifyIframeApiTypes";

export function useSpotifyPlayer(onPlaybackEnd: () => void) {
	const [spotifyController, setSpotifyController] =
		useState<SpotifyEmbedController | null>(null);
	const stopAtRef = useRef<number | null>(null);

	const callback = useCallback(
		(controller: SpotifyEmbedController) => {
			setSpotifyController(controller);

			controller.addListener("ready", () => {
				
			});

			controller.addListener("playback_update", (e) => {
				if (
					stopAtRef.current !== null &&
					e &&
					e.data.position / 1000 >= stopAtRef.current
				) {
					controller.pause();
					stopAtRef.current = null;
					onPlaybackEnd();
				}
			});
		},
		[onPlaybackEnd],
	);

	useEffect(() => {
		if (spotifyController) {
			return;
		}

		const node = document.getElementById("spotify-player");
		window.onSpotifyIframeApiReady = (iFrameApi) => {
			const element = document.getElementById("spotify-iframe");
			const options = {
				uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
				width: 0,
				height: 0,
				onStop: () => {
					onPlaybackEnd();
				},
			};

			if (element) {
				iFrameApi.createController(element, options, callback);
			}
		};

		const script = document.createElement("script");
		script.src = "https://open.spotify.com/embed/iframe-api/v1";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			node?.parentNode?.removeChild(node);
		};
	}, [onPlaybackEnd, callback, spotifyController]);

	const playSpotifyHighlight = (
		idOrUri: string,
		convertedStartSeconds: number,
		convertedEndSeconds: number,
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
