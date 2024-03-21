import { Card, Image, Text } from "@mantine/core";
import { NavLink } from "@remix-run/react";

type props = {
  id:string;
  imageUrl: string;
  title: string;
};

export const RadioShowsCard = (props: props) => {
  const { imageUrl, title , id } = props;

  return (
    <NavLink to={`/${id}`} style={{ textDecoration: "none" }}>
      <Card shadow="sm" padding="xl" component="a" withBorder>
        <Card.Section>
          <Image src={imageUrl} fallbackSrc="https://placehold.co/600x400?text=Placeholder" h={160} />
        </Card.Section>

        <Text fw={500} size="lg" mt="md">
          {title}
        </Text>
      </Card>
    </NavLink>
  );
};
