import { Grid } from "@mantine/core";
import { json } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
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

  const highlightsData = await getHighlightsForRadioshow(
    radioshowId,
    context,
    request,
    0
  );
  if (!highlightsData) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ radioshow, highlightsData, userId });
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
  invariant(highlightId, "highlightId not found");

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
    return json({ success: true, updateResult });
  } catch (error) {
    return json({ success: false, error: "Failed to update highlight." });
  }
};

// userId一致だけ抜き出しているので、今は0番目だけ抜き出して表示している。
export default function Highlights() {
  const { radioshow, highlightsData, userId } = useLoaderData<typeof loader>();
  const isEnabledUserAction = userId ? true : false;

  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <RadioShowHeader
        radioshowImageUrl={radioshow.imageUrl}
        radioshowTitle={radioshow.title}
      />
      <>
        {highlightsData.length > 0 ? (
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
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <EmptyHighlight />
        )}
      </>
      <LoginNavigateModal opened={opened} close={close} />

      <ShareButton userId={userId} />
    </>
  );
}
