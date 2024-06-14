import { Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { PaginationBar } from "~/features/Pagenation/components/PaginationBar";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/auth.server";
import { getHighlights } from "~/features/Highlight/apis/getHighlights";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { HIGHLIGHT_FETCH_LIMIT } from "~/features/Highlight/consts/highlightFetchLimit";
import { getRadioshowById } from "~/features/Radioshow/apis/getRadioshowById";
import { handleSortChange } from "~/features/Pagenation/functions/handleSortChange";
import { FixedBox } from "~/features/Player/components/FixedBox";
import { usePlayHighlight } from "~/features/Player/hooks/usePlayHighlight";
import { SORT_OPTIONS } from "~/features/Pagenation/consts/sortOptions";
import { SortOptionType } from "~/features/Pagenation/types/sortOptionsType";

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

  return json({
    highlightsData,
    userId,
    offset,
    limit,
    radioshow,
    display,
    orderBy,
    ascOrDesc,
  });
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
  const [opened, { open, close }] = useDisclosure(false);
  const [playingHighlightId, setPlayingHighlightId] = useState<string | null>(
    null
  );

  const isEnabledUserAction = userId ? true : false;

  const handleAutoStopHighlight = () => {
    setPlayingHighlightId(null);
  };

  const { playHighlight, pauseSpotifyHighlight, pauseYoutubeHighlight } =
    usePlayHighlight(handleAutoStopHighlight);

  const handlePauseHighlight = () => {
    setPlayingHighlightId(null);
    pauseSpotifyHighlight();
    pauseYoutubeHighlight();
  };

  const handlePlayHighlight = (
    id: string,
    highlightData: (typeof highlightsData)[number]
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

  // ソートオプションのマッピング
const sortOptionsMap: { [key: string]: string } = {
  totalReplayTimes: SORT_OPTIONS.TOTAL_REPLAY_TIMES,
  totalReplayTimesAsc: SORT_OPTIONS.TOTAL_REPLAY_TIMES_ASC,
  newest: SORT_OPTIONS.NEWEST,
  oldest: SORT_OPTIONS.OLDEST,
};

// defaultValueを設定
const defaultSortOption =
  sortOptionsMap[orderBy + (ascOrDesc === "asc" ? "Asc" : "")] || SORT_OPTIONS.TOTAL_REPLAY_TIMES;


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
          data={Object.values(SORT_OPTIONS)}
          defaultValue={defaultSortOption}
          clearable={false}
          allowDeselect={false}
          onChange={(sortOption) =>
            handleSortChange(
              sortOption as SortOptionType | null,
              display,
              navigate
            )
          }
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
                  highlightData={highlightData}
                  isEnabledUserAction={isEnabledUserAction}
                  open={open}
                  onAction={handleAction}
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
      <FixedBox id="spotify-iframe" />
      <FixedBox id="youtube-iframe" />
      <PaginationBar
        display={display}
        orderBy={orderBy}
        ascOrDesc={ascOrDesc}
        offset={offset}
        limit={limit}
        highlightsDataLength={highlightsData.length}
      />

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
