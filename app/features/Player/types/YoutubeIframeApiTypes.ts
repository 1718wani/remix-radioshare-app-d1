export interface YoutubeIFrameAPIOptions {
	initialVideoId: string;
	initialStartSeconds?: number;
	width?: number | string;
	height?: number | string;
}

declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
	}
}
