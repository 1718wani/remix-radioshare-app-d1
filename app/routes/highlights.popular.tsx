import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/cloudflare";
import { Grid } from "@mantine/core";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { getLotsReplayedHighlights } from "~/features/Highlight/apis/getLotsReplayedHighlights";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/authenticator";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import { useEffect, useState } from "react";
import InfiniteScroll from "~/features/Highlight/components/InfiniteScroll";

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

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset")) ?? 0;
  const limit = 10;
  const highlightsData = await getLotsReplayedHighlights(
    context,
    request,
    offset,
    limit
  );
  if (!highlightsData) {
    throw new Response("Not Found", { status: 404 });
  }

  // 目一杯取れているということは次もあるということだ。
  const hasNextPage = highlightsData.length === limit;
 // もし次のページが有るなら1切り取るが、最後のページならそのまま返す
  const resultHighlightData = hasNextPage ?  highlightsData.slice(0, -1): highlightsData

  return json({ resultHighlightData, userId, offset, hasNextPage, limit });
};

export default function HightlightsPopular() {
  const {
    resultHighlightData: initialHighlightsData,
    hasNextPage: initialHasNextPage,
    offset: initialOffset,
    userId,
    limit,
  } = useLoaderData<typeof loader>();

  const [highlightsData, setHighlightsData] = useState(initialHighlightsData);
  const [offset, setOffset] = useState(initialOffset);

  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const fetcher = useFetcher<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);
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
    console.log(fetchedData,"fetchedData")
  }, [fetcher.data, limit]);

  //  fetcher.submit({ offset: offset + limit -1 ?? "" });
  // これにすることで、offsetがlimit-1増える、limitだと4になるので5番目から取得されてしまう
  
  return (
    <>
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
                  span={{ base: 12, md: 6, lg: 3 }}
                >
                  <HighLightCardWithRadioshow
                    key={highlightData.highlight.id}
                    id={highlightData.highlight.id}
                    imageUrl={
                      highlightData.radioshow?.imageUrl ??
                      "https://picsum.photos/200/300"
                    }
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
