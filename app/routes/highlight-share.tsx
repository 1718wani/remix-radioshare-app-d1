import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Autocomplete,
  Button,
  Grid,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authenticator } from "~/features/Auth/services/auth.server";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import { getRadioshows } from "~/features/Radioshow/apis/getRadioshows";
import { TimeInput } from "@mantine/dates";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const radioshows = await getRadioshows(context, 0);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return json({ user, radioshows });
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  console.log(formData, "formData");
  const radioshows = await getAllRadioshows(context);
  const radioshowsData = radioshows.map((show) => ({
    value: show.id.toString(),
    label: show.title,
  }));
  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({
      success: false,
      message: "データの送信に失敗しました",
      submission: submission.reply(),
    });
  }

  const highlightData = submission.value;

  // highlightDataがcreateHighlightType型に合致するか検証
  try {
    validateHighlightData(highlightData);
  } catch (error) {
    return json({ success: false, message: (error as Error).message });
  }

  await createHighlight(highlightData, request, context);

  return redirect("/highlights/new");
}

export default function HightlightShare() {
  const [selectedRadioshow, setSelectedRadioshow] = useState("");
  const [opened, { open, close }] = useDisclosure(true);
  const isPc = useMediaQuery("(min-width: 64em)");

  const { radioshows } = useLoaderData<typeof loader>();
  const radioshowsData = radioshows.map((show) => ({
    value: show.id.toString(),
    label: show.title,
  }));

  const data = useActionData<typeof action>();
  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const [
    form,
    { title, description, replayUrl, radioshowData, startSeconds, endSeconds },
  ] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    if (!data) return;
    if (!data.success) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "送信に失敗しました",
        message: data.message,
        color: "red",
        icon: <IconX />,
      });
    }

    if (data.success) {
      alert(data.message);
    }
  }, [data]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 10,
        }}
        size={"80%"}
      >
        <Grid>
          <Grid.Col span={isPc ? 6 : 12}>
            <Form method="post" {...getFormProps(form)}>
              <Stack gap="md" mx={"xl"} mb={"xl"}>
                <Title order={2}>切り抜きシェア</Title>
                <Autocomplete
                  label="番組名"
                  placeholder="番組名"
                  data={radioshowsData}
                  maxDropdownHeight={200}
                  required
                  value={selectedRadioshow}
                  onChange={setSelectedRadioshow}
                  error={radioshowData.errors}
                />
                <input
                  type="hidden"
                  name="radioshowData"
                  value={selectedRadioshow}
                />
                <Link
                  to="/create"
                  style={{ textDecoration: "none", width: "fit-content" }}
                >
                  <Text
                    size="xs"
                    variant="gradient"
                    fw={700}
                    gradient={{ from: "blue", to: "blue.3" }}
                  >
                    番組名が見つからない場合はこちらから作成してください
                  </Text>
                </Link>

                <TextInput
                  {...getInputProps(title, { type: "text" })}
                  name="title"
                  placeholder="コーナー名/発言の内容など"
                  label="タイトル"
                  error={title.errors}
                  required
                />

                <Textarea
                  {...getInputProps(description, { type: "text" })}
                  name="description"
                  defaultValue={""}
                  placeholder="切り抜きの説明"
                  label="説明"
                  error={description.errors}
                />

                <TextInput
                  {...getInputProps(replayUrl, { type: "url" })}
                  name="replayUrl"
                  placeholder="https://www.youtube.com/watch,https://open.spotify.com/episode"
                  label="再生用リンク(SpotifyかYoutubeのみ)"
                  error={replayUrl.errors}
                  required
                />
                <TimeInput
                  {...getInputProps(startSeconds, { type: "text" })}
                  defaultValue={"00:00:00"}
                  error={startSeconds.errors}
                  label="開始時間を選択してください"
                  withSeconds
                />
                <TimeInput
                  {...getInputProps(endSeconds, { type: "text" })}
                  defaultValue={"00:00:00"}
                  error={endSeconds.errors}
                  label="終了時間を選択してください"
                  withSeconds
                />

                <Button fullWidth type="submit">
                  切り抜きをシェア
                </Button>
              </Stack>
            </Form>
          </Grid.Col>
          <Grid.Col span={isPc ? 6 : 0}>
            {isPc ? (
              <Image
                src="/greenlisteninggirl.png"
                alt="装飾用のヘッドホンをした女の子のイラスト"
              />
            ) : (
              <></>
            )}
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
}
