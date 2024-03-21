import { Box, Flex, Text, Button, TextInput, Menu } from "@mantine/core";
import { Form, Link, NavLink } from "@remix-run/react";

export const HeaderComponent = () => {
  return (
    <Box w={"full"} bg={"blue"} h={"42"}>
      <Flex align={"center"} justify={"space-between"} mx={"sm"}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Text fw={700} fs="italic" size="xl" c={"gray.1"}>
            RadiMoment
          </Text>
        </Link>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>menu</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>
              <NavLink to="/radioshows" style={{ textDecoration: "none" , color: "currentColor",}}>
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
        </Menu>
      </Flex>
    </Box>
  );
};
