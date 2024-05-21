import { useState, useEffect } from "react";
import { Form, Link, useRouteLoaderData } from "@remix-run/react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Autocomplete,
  Button,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { TimeInput } from "@mantine/dates";
import { z } from "zod";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { HighlightShareModalProps } from "~/routes/highlights";
import { useAtom } from "jotai";
import { isRadioshowCreateModalOpenAtom } from "~/features/Player/atoms/isRadioshowCreateModalOpenAtom";
import { isShareHighlightModalOpenAtom } from "~/features/Player/atoms/isShareHighlightModalOpenAtom";
import { loader } from "~/root";

export default function HighlightShareModal({
  opened,
  close,
  data,
}: HighlightShareModalProps) {
  const [selectedRadioshow, setSelectedRadioshow] = useState("");
  const datas = useRouteLoaderData<typeof loader>("root");

  const radioshowsData = datas
    ? datas.radioShows.map((show) => ({
        value: show.id.toString(),
        label: show.title,
      }))
    : [];

  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const [, setIsRadioshowCreateModalOpen] = useAtom(
    isRadioshowCreateModalOpenAtom
  );
  const [, setIsShareHighlightModalOpen] = useAtom(
    isShareHighlightModalOpenAtom
  );

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
      setIsShareHighlightModalOpen(false);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "投稿が完了しました",
        message: data.message,
        color: "blue",
        icon: <IconCheck />,
      });
    }
  }, [data, setIsShareHighlightModalOpen]);

  return (
    <Modal opened={opened} onClose={close} size={"lg"}>
      <Form method="post" action="/highlights" {...getFormProps(form)}>
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
          <input type="hidden" name="radioshowData" value={selectedRadioshow} />
          <Link
            onClick={() => setIsRadioshowCreateModalOpen(true)}
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
            name="startSeconds"
            defaultValue={"00:00:00"}
            error={startSeconds.errors}
            label="開始時間を選択してください"
            withSeconds
          />
          <TimeInput
            {...getInputProps(endSeconds, { type: "text" })}
            name="endSeconds"
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
    </Modal>
  );
}
