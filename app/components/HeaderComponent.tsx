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

{
  /* <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>menu</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>
              <NavLink
                to="/radioshows"
                style={{ textDecoration: "none", color: "currentColor" }}
              >
                番組一覧
              </NavLink>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item component="div">
              <Form action="/logout" method="post" style={{ margin: 0 }}>
                <input
                  type="submit"
                  value="ログアウト"
                  style={{
                    background: "none",
                    color: "currentColor",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                  }}
                />
              </Form>
            </Menu.Item>

            <Menu.Divider />

            <TextInput
              label="ユーザー名"
              mx={"sm"}
              placeholder="デフォルト"
              size="xs"
            />
          </Menu.Dropdown>
        </Menu> */
}
