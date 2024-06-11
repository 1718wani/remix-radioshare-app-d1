import { Box, Button, Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Link, Outlet, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import invariant from "tiny-invariant";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/auth.server";
import { getHighlights } from "~/features/Highlight/apis/getHighlights";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { HIGHLIGHT_FETCH_LIMIT } from "~/features/Highlight/consts/highlightFetchLimit";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";
import { convertUrlToId } from "~/features/Player/functions/convertUrlToId";
import { useSpotifyPlayer } from "~/features/Player/hooks/useSpotifyPlayer";
import { useYouTubePlayer } from "~/features/Player/hooks/useYoutubePlayer";
import { getRadioshowById } from "~/features/Radioshow/apis/getRadioshowById";
import { useIsMobile } from "~/hooks/useIsMobile";

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

  // offset（どこから取り出すか）を取得 初期値は0
  const offset = Number(url.searchParams.get("offset")) || 0;
  // orderBy（ソートキー）を取得 初期値は再生数
  const orderBy = url.searchParams.get("orderBy") || "totalReplayTimes";
  // ascOrDesc（ソート順）を取得 初期値は降順
  const ascOrDesc = url.searchParams.get("ascOrDesc") || "desc";
  // limit（一覧に表示する数）を取得 初期値は13
  const limit = HIGHLIGHT_FETCH_LIMIT;

  // display（カテゴリ）を取得 初期値はall
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
      break;
    default:
      narrowingId = display;
      break;
  }

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

  return json(
    {
      // toastMessage,
      highlightsData,
      userId,
      offset,
      limit,
      radioshow,
      display,
      orderBy,
      ascOrDesc,
    },
  );
};

export default function Hightlights() {
  const {
    highlightsData,
    userId,
    radioshow,
    display,
    offset,
    limit,
    orderBy,
    ascOrDesc,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof loader>();
  const navigate = useNavigate();
  const isMobileOS = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [playingHighlightId, setPlayingHighlightId] = useState<string | null>(
    null
  );

  const isEnabledUserAction = userId ? true : false;

  const handlePauseHighlight = () => {
    setPlayingHighlightId(null);
    pauseSpotifyHighlight();
    pauseYoutubeHighlight();
  };

  const handleAutoStopHighlight = () => {
    setPlayingHighlightId(null);
  };

  const { playSpotifyHighlight, pauseSpotifyHighlight } = useSpotifyPlayer(
    handleAutoStopHighlight
  );
  const { playYoutubeHighlight, pauseYoutubeHighlight } = useYouTubePlayer(
    handleAutoStopHighlight
  );

  // 再生する関数
  const playHighlight = useCallback(
    (highlightData: (typeof highlightsData)[0]) => {
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
        convertedStartSeconds !== undefined &&
        convertedEndSeconds !== undefined &&
        convertedStartSeconds >= 0 &&
        convertedEndSeconds >= 0 &&
        platform
      ) {
        if (platform === "spotify") {
          pauseYoutubeHighlight();
          playSpotifyHighlight(
            idOrUri,
            convertedStartSeconds,
            convertedEndSeconds
          );
        } else {
          pauseSpotifyHighlight();
          playYoutubeHighlight(
            idOrUri,
            convertedStartSeconds,
            convertedEndSeconds
          );
        }
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

  const handlePlayHighlight = (
    id: string,
    highlightData: (typeof highlightsData)[0]
  ) => {
    playHighlight(highlightData);
    setPlayingHighlightId(id);
  };

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

    navigate(
      `/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=0`
    );
  };

  return (
    <>
      <Outlet />
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
          <Grid mt={10} mx={"sm"}>
            {highlightsData.map((highlightData) => (
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
                  onPlay={() =>
                    handlePlayHighlight(
                      highlightData.highlight.id,
                      highlightData
                    )
                  }
                  playing={highlightData.highlight.id === playingHighlightId}
                  handleStop={handlePauseHighlight}
                />
              </Grid.Col>
            ))}
          </Grid>
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
        <div
          style={{
            borderRadius: "14px",
            overflow: "hidden",
          }}
          id="youtube-iframe"
        ></div>
      </Box>
      <Flex justify="space-between" mt="md" mx={"sm"} mb={rem(204)}>
        <Button
          size="xs"
          component={Link}
          to={`/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=${Math.max(
            0,
            offset - limit
          )}`}
          disabled={offset === 0}
          variant="subtle"
          leftSection={<IconChevronLeft />}
          onClick={(e) => {
            if (offset === 0) {
              e.preventDefault(); // offsetが0の場合、リンクのデフォルト動作を防ぐ（この制御がないとButtonとしてはdisableになるが、リンクとして動作してしまう）
            }
          }}
          prefetch={isMobileOS ? "viewport" : "intent"}
        >
          もどる
        </Button>
        <Button
          size="xs"
          component={Link}
          to={`/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=${
            offset + limit
          }`}
          variant="subtle"
          rightSection={<IconChevronRight />}
          disabled={highlightsData.length < limit}
          onClick={(e) => {
            if (highlightsData.length < limit) {
              e.preventDefault(); // highlightsDataの長さがlimit未満の場合、リンクのデフォルト動作を防ぐ(この制御がないとButtonとしてはdisableになるが、リンクとして動作してしまう)
            }
          }}
          prefetch={isMobileOS ? "viewport" : "intent"}
        >
          つぎへ
        </Button>
      </Flex>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
