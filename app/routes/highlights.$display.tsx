import { Box, Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/auth.server";
import { commitSession, getSession } from "~/features/Auth/session.server";
import { getHighlights } from "~/features/Highlight/apis/getHighlights";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import InfiniteScroll from "~/features/Highlight/components/InfiniteScroll";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";
import { convertUrlToId } from "~/features/Player/functions/convertUrlToId";
import { useSpotifyPlayer } from "~/features/Player/hooks/useSpotifyPlayer";
import { useYouTubePlayer } from "~/features/Player/hooks/useYoutubePlayer";
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

  const session = await getSession(request.headers.get("cookie"));
  const toastMessage = (session.get("googleAuthFlag") as string) || null;
  const logoutToastMessage = (session.get("logoutFlag") as string) || null;
  console.log(toastMessage, logoutToastMessage, "messageがあります");

  return json(
    {
      toastMessage,
      logoutToastMessage,
      resultHighlightData,
      userId,
      offset,
      hasNextPage,
      limit,
      radioshow,
      display,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
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
    toastMessage,
    logoutToastMessage,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof loader>();
  const [opened, { open, close }] = useDisclosure(false);
  const [highlightsData, setHighlightsData] = useState(initialHighlightsData);

  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [offset, setOffset] = useState(initialOffset);
  const [orderBy, setOrderBy] = useState("totalReplayTimes");
  const [ascOrDesc, setAscOrDesc] = useState("desc");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [playingHighlightIndex, setPlayingHighlightIndex] = useState<
    number | null
  >(null);

  const isEnabledUserAction = userId ? true : false;

  const handlePauseHighlight = () => {
    setPlayingHighlightIndex(null);
    pauseSpotifyHighlight();
    pauseYoutubeHighlight();
  };

  const handleAutoStopHighlight = () => {
    setPlayingHighlightIndex((prev) => (prev || 0) + 1);
  };

  const { playSpotifyHighlight, pauseSpotifyHighlight } = useSpotifyPlayer(
    handleAutoStopHighlight
  );
  const { playYoutubeHighlight, pauseYoutubeHighlight } = useYouTubePlayer(
    handleAutoStopHighlight
  );

  // 再生する関数
  const playHighlight = useCallback(
    (index: number, highlightData: (typeof highlightsData)[0]) => {
      console.log("index", index);

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

      if (
        platform === "spotify" &&
        convertedStartSeconds &&
        convertedEndSeconds
      ) {
        pauseYoutubeHighlight();
        playSpotifyHighlight(
          idOrUri,
          convertedStartSeconds,
          convertedEndSeconds
        );
      } else if (
        platform === "youtube" &&
        convertedStartSeconds &&
        convertedEndSeconds
      ) {
        pauseSpotifyHighlight();
        playYoutubeHighlight(
          idOrUri,
          convertedStartSeconds,
          convertedEndSeconds
        );
      } else {
        console.log("何も再生しない");
      }
    },
    [
      playSpotifyHighlight,
      playYoutubeHighlight,
      pauseSpotifyHighlight,
      pauseYoutubeHighlight,
    ]
  );

  useEffect(() => {
    if (playingHighlightIndex !== null && playingHighlightIndex < highlightsData.length) {
      playHighlight(
        playingHighlightIndex,
        highlightsData[playingHighlightIndex]
      );
    }
    console.log("playingHighlightIndex", playingHighlightIndex);
  }, [playingHighlightIndex, highlightsData, playHighlight]);

  const handlePlayHighlight = (index: number) => {
    setPlayingHighlightIndex(index);
  };

  useEffect(() => {
    if (toastMessage === "User Created") {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Googleによるログインが完了しました",
        message: "引き続きご利用ください！",
        color: "blue",
        icon: <IconCheck />,
      });
    }

    if (logoutToastMessage === "User Logout") {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "ログアウトしました。",
        message: "",
        color: "blue",
        icon: <IconCheck />,
      });
    }
  }, [toastMessage, logoutToastMessage]);

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
        <Title order={2}>切り抜き一覧</Title>
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
                    createdBy={highlightData.highlight.createdBy || ""}
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
                    onPlay={() => handlePlayHighlight(index)}
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
        <div id="embed-iframe"></div>
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
        <div id="youtube-iframe"></div>
      </Box>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
