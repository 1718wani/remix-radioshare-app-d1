import {
  Box,
  Flex,
  Text,
  Burger,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { useAtom } from "jotai";
import { menuOpenedAtom } from "~/features/Player/atoms/menuOpendAtom";

type Props = {
  opened: boolean;
  
};

export const HeaderComponent = ({ opened}: Props) => {
  const [, setMenuOpened] = useAtom(menuOpenedAtom);
  return (
    <Box w={"full"} bg={"blue"} h={"60"}>
      <Flex align={"center"} justify={"space-between"} p={"xs"} px={"sm"}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Text fw={800} fs="italic" size="xl" c={"gray.1"}>
            RadiMoment
          </Text>
        </Link>
        <Burger color="white" opened={opened} onClick={() => setMenuOpened(prev => !prev)} hiddenFrom="sm" size="md" />
      </Flex>
    </Box>
  );
};