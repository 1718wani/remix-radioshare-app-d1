import { Box, Burger, Flex, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { useAtom } from "jotai";
import { ShareButton } from "~/features/Highlight/components/ShareButton";
import { isSideMenuOpenAtom } from "~/features/Player/atoms/isSideMenuOpenAtom";

type Props = {
	opened: boolean;
};

export const HeaderComponent = ({ opened }: Props) => {
	const [, setMenuOpen] = useAtom(isSideMenuOpenAtom);
	return (
		<Box w={"full"} bg={"blue"} h={"60"}>
			<Flex align={"center"} justify={"space-between"} p={"xs"} px={"sm"}>
				<Link to={"/"} style={{ textDecoration: "none" }}>
					<Text fw={800} fs="italic" size="xl" c={"gray.1"}>
						RadiShare
					</Text>
				</Link>
				<Flex align={"center"}>
					<ShareButton />

					<Burger
						color="white"
						opened={opened}
						onClick={() => setMenuOpen((prev) => !prev)}
						hiddenFrom="sm"
						size="md"
						ml={"sm"}
					/>
				</Flex>
			</Flex>
		</Box>
	);
};
