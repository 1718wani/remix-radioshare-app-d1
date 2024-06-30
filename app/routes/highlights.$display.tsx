import { Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
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
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/auth.server";
import { getHighlights } from "~/features/Highlight/apis/getHighlights";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { HIGHLIGHT_FETCH_LIMIT } from "~/features/Highlight/consts/highlightFetchLimit";
import { PaginationBar } from "~/features/Pagenation/components/PaginationBar";
import { SORT_OPTIONS } from "~/features/Pagenation/consts/sortOptions";
import { handleSortChange } from "~/features/Pagenation/functions/handleSortChange";
import type { SortOptionType } from "~/features/Pagenation/types/sortOptionsType";
import { FixedBox } from "~/features/Player/components/FixedBox";
import { usePlayHighlight } from "~/features/Player/hooks/usePlayHighlight";
import { getRadioshowById } from "~/features/Radioshow/apis/getRadioshowById";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "切り抜き一覧 | アプリケーション名" },
      { name: "description", content: "ラジオ番組の切り抜き一覧ページです。" },
    ];
  }

  const { display, radioshow } = data;

  // displayの値に基づいてタイトルを設定
  let title = "切り抜き一覧";
  switch (display) {
    case "saved":
      title = "保存済み切り抜き";
      break;
    case "liked":
      title = "いいねした切り抜き";
      break;
    case "notReplayed":
      title = "未再生の切り抜き";
      break;
    case "all":
      title = "すべての切り抜き";
      break;
    default:
      // radioshowがある場合は番組名を表示
      if (radioshow) {
        title = `${radioshow.title}の切り抜き`;
      }
      break;
  }

  return [
    { title: `${title} | アプリケーション名` },
    {
      name: "description",
      content: `${title}のページです。お気に入りの切り抜きを見つけましょう。`,
    },
  ];
};

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
  const orderBy = url.searchParams.get("orderBy") || "totalReplayTimes";
  const ascOrDesc = url.searchParams.get("ascOrDesc") || "desc";
  const limit = HIGHLIGHT_FETCH_LIMIT;

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

  const isEnabledUserAction = !!userId;

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

  // デフォルトのソートオプションを決定する関数
  const getDefaultSortOption = (
    orderBy: string,
    ascOrDesc: string
  ): SortOptionType => {
    if (orderBy === "totalReplayTimes") {
      return ascOrDesc === "desc"
        ? SORT_OPTIONS.TOTAL_REPLAY_TIMES
        : SORT_OPTIONS.TOTAL_REPLAY_TIMES_ASC;
    }
    if (orderBy === "createdAt") {
      return ascOrDesc === "desc" ? SORT_OPTIONS.NEWEST : SORT_OPTIONS.OLDEST;
    }
    // デフォルトのケース
    return SORT_OPTIONS.TOTAL_REPLAY_TIMES;
  };

  const defaultSortOption = getDefaultSortOption(orderBy, ascOrDesc);

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
          aria-label="並び替え"
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
      <FixedBox
        id="spotify-iframe"
        title="Spotify再生中コンテンツ"
        divProps={{ "aria-label": "Spotify再生中コンテンツ" }}
      />
      <FixedBox
        id="youtube-iframe"
        title="Youtube再生中コンテンツ"
        divProps={{ "aria-label": "Youtube再生中コンテンツ" }}
      />
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
