import { Card, Image, Text } from "@mantine/core";
import { NavLink } from "@remix-run/react";
import { customeDomain } from "~/consts/customeDomain";

type Props = {
	id: string;
	imageUrl: string;
	title: string;
};

export const RadioShowsCard = (props: Props) => {
	const { imageUrl, title, id } = props;
	const correctImageUrl = `${customeDomain}${imageUrl}`;

	return (
		<NavLink to={`/${id}`} style={{ textDecoration: "none" }}>
			<Card shadow="sm" padding="xl" component="a" withBorder={true}>
				<Card.Section>
					<Image
						src={correctImageUrl}
						fallbackSrc="https://placehold.co/600x400?text=Placeholder"
						h={160}
						alt={`${title}のサムネイル画像`}
					/>
				</Card.Section>

				<Text fw={500} size="lg" mt="md">
					{title}
				</Text>
			</Card>
		</NavLink>
	);
};
