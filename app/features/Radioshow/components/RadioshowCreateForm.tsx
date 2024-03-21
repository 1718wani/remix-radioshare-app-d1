import { Button, Stack, TextInput } from "@mantine/core";
import { useFetcher } from "@remix-run/react";

export const RadioshowCreateForm = () => {
  const fetcher = useFetcher();
  return (
    <>
      <fetcher.Form  method="post" >
        <Stack gap="md" mx={"xl"}>
          <TextInput name="title" label="番組タイトル" placeholder="番組名" />
          <TextInput name="imageUrl" label="画像URL" placeholder="ヘッダー画像URL" />
          <Button fullWidth type="submit">
            新規登録
          </Button>
        </Stack>
      </fetcher.Form>
    </>
  );
};
