import { Center, Image, Modal, Stack } from "@mantine/core";
import { Form } from "@remix-run/react";
import { GoogleButton } from "./GoogleButton";

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
      zIndex={10000}
    >
      <Stack>
        <Image
          width="40"
          height="auto"
          fit="cover"
          src="/beforelogingirl.png"
          alt="ログイン画面の女の子の画像"
        />
        <Center>
          <Stack>
            <Form method="post" action="/google-sign-in-or-up" onClick={close}>
              <GoogleButton
                aria-label="Googleアカウントでログイン or 登録"
                type="submit"
                my={"md"}
              >
                Googleアカウントで ログイン or 登録
              </GoogleButton>
            </Form>
          </Stack>
        </Center>
      </Stack>
    </Modal>
  );
};
