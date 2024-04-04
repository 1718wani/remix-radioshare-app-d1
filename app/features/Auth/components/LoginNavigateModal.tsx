import { Button, Center, Image, Modal, Stack, Text } from "@mantine/core";
import { Link, NavLink } from "@remix-run/react";

interface LoginNavigateModalProps {
  opened: boolean;
  close: () => void;
}

export const LoginNavigateModal = ({
  opened,
  close,
}: LoginNavigateModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="操作を続けるにはログインしてください"
   
    >
      <Stack>
        <Image
          width="40"
          height="auto"
          fit="cover"
          src="/beforelogingirl.png"
          alt="beforelogin"
        />
        <Center>
          <Stack>
            <NavLink to={"/signin"}>
              <Button>ログイン画面へ</Button>
            </NavLink>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <Text
                size="sm"
                variant="gradient"
                fw={700}
                gradient={{ from: "blue", to: "blue.3" }}
              >
                新規登録の方はこちら
              </Text>
            </Link>
          </Stack>
        </Center>
      </Stack>
    </Modal>
  );
};
