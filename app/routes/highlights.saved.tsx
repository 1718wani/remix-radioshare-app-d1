import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Button, Center, Grid } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { HighLightCardWithRadioshow } from "~/features/Highlight/components/HighLightCardWithRadioshow";
import { updateHighlight } from "~/features/Highlight/apis/updateHighlight";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { authenticator } from "~/features/Auth/services/authenticator";
import { getSavedHighlights } from "~/features/Highlight/apis/getSavedHighlights";

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const highlightId = Number(formData.get("id"));

  try {
    const updateResult = await updateHighlight(
      // highlightId,
      highlightId,
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});
  const highlightsWithRadioshow = await getSavedHighlights(request, 0);
  if (!highlightsWithRadioshow) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ highlightsWithRadioshow, userId });
};

export default function HightlightsSaved() {
  const data = useLoaderData<typeof loader>();
  const isEnabledUserAction = data.userId ? true : false;

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Grid mt={10} mx={"sm"}>
        {data.highlightsWithRadioshow.map((highlight) => (
          <Grid.Col key={highlight.id} span={{ base: 12, md: 6, lg: 3 }}>
            <HighLightCardWithRadioshow
              key={highlight.id}
              id={highlight.id}
              imageUrl={
                highlight.radioshow.imageUrl ?? "https://picsum.photos/200/300"
              }
              title={highlight.title}
              radioshowTitle={highlight.radioshow.title}
              description={highlight.description}
              replayUrl={highlight.replayUrl}
              createdAt={highlight.createdAt}
              liked={
                highlight.userHighlights[0]
                  ? highlight.userHighlights[0].liked
                  : false
              }
              saved={
                highlight.userHighlights[0]
                  ? highlight.userHighlights[0].saved
                  : false
              }
              played={
                highlight.userHighlights[0]
                  ? highlight.userHighlights[0].played
                  : false
              }
              radioshowId={highlight.radioshow.id}
              totalReplayTimes={highlight.totalReplayTimes}
              isEnabledUserAction={isEnabledUserAction}
              open={open}
            />
          </Grid.Col>
        ))}
      </Grid>
      <Center mt={"md"}>
        <Button>もっと見る</Button>
      </Center>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
}
