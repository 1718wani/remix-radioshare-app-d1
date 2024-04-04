import {
  Box,
  Flex,
  Text,
  Burger,
} from "@mantine/core";
import { Link } from "@remix-run/react";

type Props = {
  opened: boolean;
  toggle: () => void;
};

export const HeaderComponent = ({ opened, toggle }: Props) => {
  return (
    <Box w={"full"} bg={"blue"} h={"60"}>
      <Flex align={"center"} justify={"space-between"} p={"xs"} px={"sm"}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Text fw={800} fs="italic" size="xl" c={"gray.1"}>
            RadiMoment
          </Text>
        </Link>
        <Burger color="white" opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />
      </Flex>
    </Box>
  );
};