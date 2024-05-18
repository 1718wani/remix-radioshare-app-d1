export const convertUrlToId = (
  url: string
): { platform: "youtube" | "spotify" | null; idOrUri: string | null } => {
  const spotifyRegex = /https:\/\/open\.spotify\.com\/episode\/([a-zA-Z0-9]+)/;
  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;

  const spotifyMatch = url.match(spotifyRegex);
  if (spotifyMatch) {
    const episodeId = spotifyMatch[1];
    return { platform: "spotify", idOrUri: `spotify:episode:${episodeId}` };
  }

  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return { platform: "youtube", idOrUri: videoId };
  }

  return { platform: null, idOrUri: null };
};
