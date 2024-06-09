import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Autocomplete,
  Button,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import {
  useRouteLoaderData,
  Form,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { useToastForFormAction } from "~/features/Notification/hooks/useToastForFormAction";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import { loader as rootLoader } from "~/root";
import { loader as highlightsLoader } from "~/routes/highlights.$display";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
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

  return json({ success: true, message: "切り抜きシェアが完了しました" });
};

export default function HighlightCreate() {
  const [selectedRadioshow, setSelectedRadioshow] = useState("");
  const [opened, { close }] = useDisclosure(true);
  const routeLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const radioshowsData = routeLoaderData
    ? routeLoaderData.radioShows.map((show) => ({
        value: show.id.toString(),
        label: show.title,
      }))
    : [];

  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const [
    form,
    { title, description, replayUrl, radioshowData, startSeconds, endSeconds },
  ] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const handleOpenRadioshowCreateModal = () => {
    navigate(`/highlights/${highlightLoaderData?.display}/radio-create`);
  };

  const handleCloseModal = () => {
    close();
    navigate(`/highlights/${highlightLoaderData?.display}`);
  };

  useToastForFormAction({ actionData});

  return (
    <Modal
      title="切り抜きシェア"
      opened={opened}
      onClose={handleCloseModal}
      size={"lg"}
      zIndex={300}
    >
      <Form method="post" {...getFormProps(form)}>
        <Stack gap="md" mx={"xl"} mb={"xl"}>
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
          <button
            type="button"
            onClick={handleOpenRadioshowCreateModal}
            style={{
              textDecoration: "none",
              width: "fit-content",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            <Text
              size="xs"
              variant="gradient"
              fw={700}
              gradient={{ from: "blue", to: "blue.3" }}
            >
              番組名が見つからない場合はこちらから作成してください
            </Text>
          </button>

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
