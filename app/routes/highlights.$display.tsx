import { Box, Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { IconX } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/authenticator";
import { getHighlights } from "~/features/Highlight/apis/getHighlights";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import InfiniteScroll from "~/features/Highlight/components/InfiniteScroll";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { highlightCardWithRadioshowProps } from "~/features/Highlight/types/highlightCardWithRadioshowProps";
import { spotifyPlayerAtom } from "~/features/Player/atoms/spotifyEmbedRefAtom";
import { youtubePlayerAtom } from "~/features/Player/atoms/youtubeEmbedRefAtom";
import { SpotifyPlayer } from "~/features/Player/components/SpotifyPlayer";
import { YoutubePlayer } from "~/features/Player/components/YouTubePlayer";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";
import { convertUrlToId } from "~/features/Player/functions/convertUrlToId";
import {
  SpotifyEmbedController,
  SpotifyPlayerRef,
} from "~/features/Player/types/SpotifyIframeApiTypes";
import { getRadioshowById } from "~/features/Radioshow/apis/getRadioshowById";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const replayed = formData.has("replayed")
    ? formData.get("replayed") === "true"
    : undefined;
  const saved = formData.has("saved")
    ? formData.get("saved") === "true"
    : undefined;
  const liked = formData.has("liked")
    ? formData.get("liked") === "true"
    : undefined;

  const highlightId = formData.get("id") as string;

  if (replayed) {
    await incrementTotalReplayTimes(highlightId, context);
  }

  try {
    const updateResult = await updateHighlight(
      highlightId,
      context,
      request,
      replayed,
      saved,
      liked
    );

    return json({ result: updateResult });
  } catch (error) {
    return json({ error });
  }
};

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = 13;
  const display = params.display;

  invariant(display, "一覧が見つかりません。");

  let narrowingBy: "saved" | "liked" | "notReplayed" | "all" | undefined;
  let narrowingId: string | undefined;
  switch (display) {
    case "saved":
      narrowingBy = "saved";
      break;
    case "liked":
      narrowingBy = "liked";
      break;
    case "notReplayed":
      narrowingBy = "notReplayed";
      break;
    case "all":
      narrowingBy = "all";
      break;
    default:
      narrowingId = display;
      break;
  }

  const orderBy = url.searchParams.get("orderBy") || "totalReplayTimes";
  const ascOrDesc = url.searchParams.get("ascOrDesc") || "desc";

  const radioshow = await getRadioshowById(narrowingId || "", context);

  const highlightsData = await getHighlights(
    context,
    request,
    offset,
    limit,
    ascOrDesc,
    orderBy,
    narrowingBy,
    narrowingId
  );
  if (!highlightsData) {
    throw new Response("Not Found", { status: 404 });
  }

  // 取得限界値と同じ長さのデータを取得できた場合は、次のページがある
  const hasNextPage = highlightsData.length === limit;
  // 次のページがあるなら末尾1つを切り取る、最後のページなら取得データをすべて返す
  const resultHighlightData = hasNextPage
    ? highlightsData.slice(0, -1)
    : highlightsData;

  return json({
    resultHighlightData,
    userId,
    offset,
    hasNextPage,
    limit,
    radioshow,
    display,
  });
};

export default function Hightlights() {
  const {
    resultHighlightData: initialHighlightsData,
    hasNextPage: initialHasNextPage,
    offset: initialOffset,
    userId,
    limit,
    radioshow,
    display,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof loader>();
  const [opened, { open, close }] = useDisclosure(false);
  const [highlightsData, setHighlightsData] = useState(initialHighlightsData);
  console.log("これが再生されるデータ",highlightsData)

  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [offset, setOffset] = useState(initialOffset);
  const [orderBy, setOrderBy] = useState("totalReplayTimes");
  const [ascOrDesc, setAscOrDesc] = useState("desc");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const spotifyPlayerRef = useRef<SpotifyPlayerRef>(null);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const youtubePlayerAtomValue =
    useAtomValue<MutableRefObject<YT.Player | null> | null>(youtubePlayerAtom);
  const spotifyPlayerAtomValue =
    useAtomValue<MutableRefObject<SpotifyEmbedController | null> | null>(
      spotifyPlayerAtom
    );
  const youtubePlayer = youtubePlayerAtomValue?.current;
  const spotifyPlayer = spotifyPlayerAtomValue?.current;

  const isEnabledUserAction = userId ? true : false;

  const [endTime, setEndTime] = useState<number | null>(null);

  // 再生しているIndex（連続再生用に） そしてこれはコンポーネントにわたす。
  const [playingHighlightIndex, setPlayingHighlightIndex] = useState<
    number | null
  >(null);

  // const [isListPlaying,se]

  // 再生する関数
  const handlePlayHighlight = (
    index: number,
    highlightData: (typeof highlightsData)[0]
  ) => {
    console.log("再生されるindex", index);
    const { platform, idOrUri } = convertUrlToId(
      highlightData.highlight.replayUrl
    );
    const convertedStartSeconds = convertHHMMSSToSeconds(
      highlightData.highlight.startHHmmss
    );
    const convertedEndSeconds = convertHHMMSSToSeconds(
      highlightData.highlight.endHHmmss
    );

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

    console.log("index", index)

    setPlayingHighlightIndex(index);

    if (platform === "spotify") {
      console.log("Spotifyのほうが呼び出されました", spotifyPlayerRef);
      setEndTime(convertedEndSeconds ?? 0);
      // Youtubeの再生をストップする
      youtubePlayer?.stopVideo();
      // Youtubeを非表示にする
      youtubePlayer?.setSize(0, 0);
      spotifyPlayer?.setIframeDimensions(320, 80);
      spotifyPlayer?.loadUri(idOrUri, false, convertedStartSeconds ?? 0);
      spotifyPlayer?.play();
    } else if (platform === "youtube") {
      spotifyPlayer?.pause();
      youtubePlayer?.setSize(320, 80);
      console.log("Youtubeのほうが呼び出されました", youtubePlayerRef);
      youtubePlayer?.loadVideoById({
        videoId: idOrUri,
        startSeconds: convertedStartSeconds,
        endSeconds: convertedEndSeconds,
        suggestedQuality: "small",
      });
    } else {
      console.log("特に何もしない");
    }
  };

  const handlePauseHighlight = () => {
    console.log("これは呼び出されてると良くない")
    setPlayingHighlightIndex(null);
    youtubePlayer?.stopVideo();
    spotifyPlayer?.pause();
  };

  // // 次のハイライトを再生する関数
  // const playNextHighlight = () => {
  //   const playingHighlightIndexQueue = playingHighlightIndex ?? 0;
  //   console.log("playNextHighlight", playingHighlightIndexQueue);
  //   //  if (!playingHighlightIndex) {
  //   //    console.log("再生できません")
  //   //    return
  //   //  }
  //   // const nextIndex = playingHighlightIndex + 1; 
  //   const nextIndex = playingHighlightIndexQueue !== null ? playingHighlightIndexQueue + 1 : 0; 
  //   console.log("nextIndex", nextIndex);
  //   if (nextIndex < highlightsData.length) {

  //     handlePlayHighlight(nextIndex, highlightsData[nextIndex]);
  //   } else {
  //     console.log("終了しました");
  //   }
  // };

  // 再生終了時のイベントハンドラ
  // const handleStop = () => {
    
  //   setTimeout(() => {
  //     playNextHighlight(); // 次のハイライトを再生
  //   }, 100); 
  // };

  

  const handleAction = (
    id: string,
    actionType: "replayed" | "saved" | "liked",
    value: boolean
  ) => {
    fetcher.submit({ id, [actionType]: value.toString() }, { method: "post" });
  };

  const handleSortChange = (sortOption: string | null) => {
    let orderBy = "totalReplayTimes"; // デフォルトのソートキー
    let ascOrDesc = "desc"; // デフォルトのソート順

    switch (sortOption) {
      case "再生数順":
        orderBy = "totalReplayTimes";
        ascOrDesc = "desc";
        break;
      case "再生数少順":
        orderBy = "totalReplayTimes";
        ascOrDesc = "asc";
        break;
      case "新しい順":
        orderBy = "createdAt";
        ascOrDesc = "desc";
        break;
      case "古い順":
        orderBy = "createdAt";
        ascOrDesc = "asc";
        break;
    }

    setOrderBy(orderBy);
    setAscOrDesc(ascOrDesc);

    fetcher.load(
      `/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=0`
    );
  };

  useEffect(() => {
    const fetchedData = fetcher.data;
    if (fetchedData?.resultHighlightData) {
      if (fetchedData.offset === 0) {
        // 新しいクエリパラメータでデータをロードした場合、データを置き換える
        setHighlightsData(fetchedData.resultHighlightData);
      } else {
        // ページネーションでデータを追加する場合
        setHighlightsData((prev) => [
          ...prev,
          ...fetchedData.resultHighlightData,
        ]);
      }
      setOffset(fetchedData.offset);
      setHasNextPage(fetchedData.hasNextPage);
    }
  }, [fetcher.data]);

  return (
    <>
      {radioshow && (
        <RadioShowHeader
          radioshowImageUrl={radioshow.imageUrl || ""}
          radioshowTitle={radioshow.title || ""}
        />
      )}

      <Flex justify={"space-between"} m={"md"}>
        <Title order={2}>ハイライト一覧</Title>
        <Select
          withCheckIcon={false}
          w={rem(120)}
          data={["再生数順", "再生数少順", "新しい順", "古い順"]}
          defaultValue={"再生数順"}
          clearable={false}
          allowDeselect={false}
          onChange={handleSortChange}
        />
      </Flex>
      {highlightsData.length > 0 ? (
        <>
          <InfiniteScroll
            loadMore={() => {
              if (fetcher.state === "idle") {
                fetcher.load(
                  `/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=${
                    offset + limit - 1
                  } `
                );
              }
            }}
            hasNextPage={hasNextPage}
          >
            <Grid mt={10} mb={140} mx={"sm"}>
              {highlightsData.map((highlightData, index) => (
                <Grid.Col
                  key={highlightData.highlight.id}
                  span={{ base: 12, md: 6, lg: 4 }}
                >
                  <HighLightCardWithRadioshow
                    key={highlightData.highlight.id}
                    id={highlightData.highlight.id}
                    imageUrl={highlightData.radioshow?.imageUrl || ""}
                    title={highlightData.highlight.title}
                    description={highlightData.highlight.description || ""}
                    replayUrl={highlightData.highlight.replayUrl}
                    createdAt={highlightData.highlight.createdAt || ""}
                    liked={highlightData.userHighlight?.liked || false}
                    saved={highlightData.userHighlight?.saved || false}
                    replayed={highlightData.userHighlight?.replayed || false}
                    totalReplayTimes={
                      highlightData.highlight.totalReplayTimes || 0
                    }
                    radioshowId={highlightData.highlight.radioshowId || ""}
                    isEnabledUserAction={isEnabledUserAction}
                    open={open}
                    onAction={handleAction}
                    startHHmmss={highlightData.highlight.startHHmmss}
                    endHHmmss={highlightData.highlight.endHHmmss}
                    onPlay={() => handlePlayHighlight(index, highlightData)}
                    playing={index === playingHighlightIndex}
                    handleStop={handlePauseHighlight}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </InfiniteScroll>
        </>
      ) : (
        <EmptyHighlight />
      )}

      <Box
        style={{
          position: "fixed",
          right: isMobile ? "50%" : "3%",
          transform: isMobile ? "translateX(50%)" : "none",
          bottom: "3%",
          zIndex: 3,
        }}
      >
        <SpotifyPlayer
          ref={spotifyPlayerRef}
          uri="spotify:episode:67hjIN8AH2KiIhWiA8XyuO"
          onStop={handlePauseHighlight}
          endTime={endTime}
        />
      </Box>

      <Box
        style={{
          position: "fixed",
          right: isMobile ? "50%" : "3%",
          transform: isMobile ? "translateX(50%)" : "none",
          bottom: "3%",
          zIndex: 3,
        }}
      >
        <YoutubePlayer
          ref={youtubePlayerRef}
          initialVideoId=""
          initialStartSeconds={0}
          onStop={handlePauseHighlight}
        />
      </Box>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
