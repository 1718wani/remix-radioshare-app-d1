import { Flex, Grid, Select, Title, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
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
  const offset = Number(url.searchParams.get("offset")) ?? 0;
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

  
  const radioshow = await getRadioshowById(narrowingId || "", context);

  const highlightsData = await getHighlights(
    context,
    request,
    offset,
    limit,
    "desc",
    "totalReplayTimes",
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
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);
  const [highlightsData, setHighlightsData] = useState(initialHighlightsData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [offset, setOffset] = useState(initialOffset);
  const isEnabledUserAction = userId ? true : false;

  const handleAction = (
    id: string,
    actionType: "replayed" | "saved" | "liked",
    value: boolean
  ) => {
    fetcher.submit({ id, [actionType]: value.toString() }, { method: "post" });
  };

  useEffect(() => {
    const fetchedData = fetcher.data;
    if (
      fetchedData?.resultHighlightData &&
      fetchedData.resultHighlightData.length > 0
    ) {
      setHighlightsData((prev) => [
        ...prev,
        ...fetchedData.resultHighlightData,
      ]);

      setOffset(fetchedData.offset);
      setHasNextPage(fetchedData.hasNextPage);
    }
  }, [fetcher.data, limit]);

  return (
    <>
      {radioshow && (
        <RadioShowHeader
          radioshowImageUrl={radioshow.imageUrl ?? ""}
          radioshowTitle={radioshow.title ?? ""}
        />
      )}

      <Flex justify={"space-between"} m={"md"}>
        <Title order={2}>ハイライト一覧</Title>
        <Select
          withCheckIcon={false}
          w={rem(120)}
          data={["人気順", "新しい順"]}
          defaultValue={"人気順"}
          clearable={false}
          allowDeselect={false}
        />
      </Flex>
      {highlightsData.length > 0 ? (
        <>
          <InfiniteScroll
            loadMore={() => {
              if (fetcher.state === "idle") {
                fetcher.submit({ offset: offset + limit - 1 ?? "" });
              }
            }}
            hasNextPage={hasNextPage}
          >
            <Grid mt={10} mx={"sm"}>
              {highlightsData.map((highlightData) => (
                <Grid.Col
                  key={highlightData.highlight.id}
                  span={{ base: 12, md: 6, lg: 4 }}
                >
                  <HighLightCardWithRadioshow
                    key={highlightData.highlight.id}
                    id={highlightData.highlight.id}
                    imageUrl={highlightData.radioshow?.imageUrl ?? ""}
                    title={highlightData.highlight.title}
                    description={highlightData.highlight.description ?? ""}
                    replayUrl={highlightData.highlight.replayUrl}
                    createdAt={highlightData.highlight.createdAt ?? ""}
                    liked={highlightData.userHighlight?.liked ?? false}
                    saved={highlightData.userHighlight?.saved ?? false}
                    replayed={highlightData.userHighlight?.replayed ?? false}
                    totalReplayTimes={
                      highlightData.highlight.totalReplayTimes ?? 0
                    }
                    radioshowId={highlightData.highlight.radioshowId ?? ""}
                    isEnabledUserAction={isEnabledUserAction}
                    open={open}
                    onAction={handleAction}
                    startHHmmss={highlightData.highlight.startHHmmss}
                    endHHmmss={highlightData.highlight.endHHmmss}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </InfiniteScroll>
        </>
      ) : (
        <EmptyHighlight />
      )}

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
