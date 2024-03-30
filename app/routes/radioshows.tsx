import { Grid } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { getRadioshows } from "~/features/Radioshow/apis/getRadioshows";
import { NewRadioshowButton } from "~/features/Radioshow/components/NewRadioshowButton";
import { RadioShowsCard } from "~/features/Radioshow/components/RadioShowsCard";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const radioShows = await getRadioshows(context, 0);

  if (!radioShows) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ radioShows });
};

export default function Radioshows() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Grid mt={10} mx={"sm"}>
        {data.radioShows.map((card) => (
          <Grid.Col key={card.id} span={{ base: 12, md: 6, lg: 3 }}>
            <RadioShowsCard
              key={card.id}
              id={card.id.toString()}
              imageUrl={card.imageUrl ?? "https://picsum.photos/200/300"}
              title={card.title}
            />
          </Grid.Col>
        ))}
      </Grid>
      <NewRadioshowButton />
    </>
  );
}
