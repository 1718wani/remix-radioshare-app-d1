import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Button, Center, Grid } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { getLotsReplayedHighlights } from "~/features/Highlight/apis/getLotsReplayedHighlights";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/authenticator";
import { EmptyHighlight } from "~/features/Highlight/components/EmptyHighlight";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const played = formData.has("played")
    ? formData.get("played") === "true"
    : undefined;
  const saved = formData.has("saved")
    ? formData.get("saved") === "true"
    : undefined;
  const liked = formData.has("liked")
    ? formData.get("liked") === "true"
    : undefined;

  const highlightId = formData.get("id") as string;

  try {
    const updateResult = await updateHighlight(
      // highlightId,
      highlightId,
      context,
      request,
      played,
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
  const highlightsData = await getLotsReplayedHighlights(context, request, 0);
  if (!highlightsData) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ highlightsData, userId });
};

export default function HightlightsPopular() {
  const data = useLoaderData<typeof loader>();
  const isEnabledUserAction = data.userId ? true : false;
  console.log(data.highlightsData, "highlightsWithRadioshow");

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {data.highlightsData.length > 0 ? (
        <>
          <Grid mt={10} mx={"sm"}>
            {data.highlightsData.map((highlightData) => (
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
                  played={highlightData.userHighlight?.replayed ?? false}
                  totalReplayTimes={
                    highlightData.highlight.totalReplayTimes ?? 0
                  }
                  radioshowId={highlightData.highlight.radioshowId ?? ""}
                  isEnabledUserAction={isEnabledUserAction}
                  open={open}
                />
              </Grid.Col>
            ))}
          </Grid>
          <Center mt={"md"}>
            <Button>もっと見る</Button>
          </Center>
        </>
      ) : (
        <EmptyHighlight />
      )}

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}