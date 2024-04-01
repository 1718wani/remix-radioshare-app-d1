import { Grid } from "@mantine/core";
import { json } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/authenticator";
import { getRadioshowById } from "~/features/Radioshow/apis/getRadioshowById";
import { getHighlightsForRadioshow } from "~/features/Highlight/apis/getHighlightsForRadioshow";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";
import { ShareButton } from "~/features/Highlight/components/ShareButton";
import { HighLightCard } from "~/features/Highlight/components/HighLightCard";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { incrementTotalReplayTimes } from "~/features/Highlight/apis/incrementTotalReplayTimes";
import InfiniteScroll from "~/features/Highlight/components/InfiniteScroll";
import { useEffect, useState } from "react";

export const loader = async ({
  params,
  request,
  context,
}: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});
  invariant(params.radioshowId, "Missing contactId param");
  const radioshowId = params.radioshowId;
  const radioshow = await getRadioshowById(radioshowId, context);
  invariant(radioshow, "Radioshow not found");
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset")) ?? 0;
  const limit = 13;

  const highlightsData = await getHighlightsForRadioshow(
    radioshowId,
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
  const resultHighlightData = hasNextPage
    ? highlightsData.slice(0, -1)
    : highlightsData;

  return json({radioshow, resultHighlightData, userId, offset, hasNextPage, limit });
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

// userId一致だけ抜き出しているので、今は0番目だけ抜き出して表示している。
export default function Highlights() {
  const {
    radioshow,
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
    console.log(fetchedData, "fetchedData");
  }, [fetcher.data, limit]);
  return (
    <>
      <RadioShowHeader
        radioshowImageUrl={radioshow.imageUrl}
        radioshowTitle={radioshow.title}
      />
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
                    <HighLightCard
                      id={highlightData.highlight.id}
                      title={highlightData.highlight.title}
                      description={highlightData.highlight.description ?? ""}
                      replayUrl={highlightData.highlight.replayUrl}
                      createdAt={highlightData.highlight.createdAt ?? ""}
                      liked={
                        highlightData.userHighlight?.liked
                          ? highlightData.userHighlight?.liked
                          : false
                      }
                      saved={
                        highlightData.userHighlight?.saved
                          ? highlightData.userHighlight.saved
                          : false
                      }
                      replayed={
                        highlightData.userHighlight?.replayed
                          ? highlightData.userHighlight.replayed
                          : false
                      }
                      totalReplayTimes={
                        highlightData.highlight.totalReplayTimes ?? 0
                      }
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
      </>
      <LoginNavigateModal opened={opened} close={close} />

      <ShareButton userId={userId} />
    </>
  );
}
