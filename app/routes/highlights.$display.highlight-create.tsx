import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Autocomplete,
  Button,
  Flex,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/cloudflare";
import {
  useRouteLoaderData,
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { useToastForFormAction } from "~/features/Notification/hooks/useToastForFormAction";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import { useIsMobile } from "~/hooks/useIsMobile";
import { loader as rootLoader } from "~/root";
import { loader as highlightsLoader } from "~/routes/highlights.$display";

export const meta: MetaFunction = () => {
  return [
    { title: "切り抜きシェア | RadiShare" },
    {
      name: "description",
      content:
        "新しい切り抜きを投稿するページです。ラジオ番組の切り抜きをシェアしましょう。",
    },
  ];
};

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
  const [opened, { close }] = useDisclosure(true);
  const routeLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );
  const { display } = useParams();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isMobileOS = useIsMobile();

  const radioshowsData = routeLoaderData
    ? routeLoaderData.radioShows.map((show) => ({
        value: show.id.toString(),
        label: show.title,
      }))
    : [];

  // 現在のradioidに基づいてデフォルトの番組を見つける
  const defaultRadioshow = radioshowsData.find(
    (show) => show.value === display
  );

  const [selectedRadioshow, setSelectedRadioshow] = useState(
    defaultRadioshow ? defaultRadioshow.label : ""
  );

  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const [
    form,
    {
      title,
      description,
      replayUrl,
      radioshowData,
      startHours,
      startMinutes,
      startSeconds,
      endHours,
      endMinutes,
      endSeconds,
    },
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

  useToastForFormAction({ actionData });

  const hours = Array.from({ length: 4 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));
  const minutesAndSeconds = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

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
              番組名が見つからない場合はこちらから作成
            </Text>
          </button>

          <TextInput
            {...getInputProps(title, { type: "text" })}
            name="title"
            placeholder="コーナー名/発言の内容など"
            label="タイトル"
            error={title.errors}
          />

          <Textarea
            {...getInputProps(description, { type: "text" })}
            name="description"
            defaultValue={""}
            placeholder="切り抜きの説明"
            label="説明（オプション）"
            error={description.errors}
          />

          <TextInput
            {...getInputProps(replayUrl, { type: "url" })}
            name="replayUrl"
            placeholder="https://www.youtube.com/watch,https://open.spotify.com/episode"
            label="再生用リンク(SpotifyかYoutubeのみ)"
            error={replayUrl.errors}
          />
          <Stack gap={rem(3)}>
            <Text size="sm">開始時間</Text>
            <Flex gap={"xs"} align={"center"}>
              <Select
                {...getInputProps(startHours, { type: "text" })}
                name="startHours"
                data={hours}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
              <Text>:</Text>
              <Select
                {...getInputProps(startMinutes, { type: "text" })}
                name="startMinutes"
                data={minutesAndSeconds}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
              <Text>:</Text>
              <Select
                {...getInputProps(startSeconds, { type: "text" })}
                name="startSeconds"
                data={minutesAndSeconds}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
            </Flex>
          </Stack>

          <Stack gap={rem(3)}>
            <Text size="sm">終了時間</Text>
            <Flex gap={"xs"} align={"center"}>
              <Select
                {...getInputProps(endHours, { type: "text" })}
                name="endHours"
                data={hours}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
              <Text>:</Text>
              <Select
                {...getInputProps(endMinutes, { type: "text" })}
                name="endMinutes"
                data={minutesAndSeconds}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
              <Text>:</Text>
              <Select
                {...getInputProps(endSeconds, { type: "text" })}
                name="endSeconds"
                data={minutesAndSeconds}
                defaultValue={"00"}
                withCheckIcon={false}
                clearable={false}
                allowDeselect={false}
                onFocus={(e) => (isMobileOS ? e.target.blur() : null)}
              />
            </Flex>
            {(startHours.errors ||
              startMinutes.errors ||
              startSeconds.errors ||
              endHours.errors ||
              endMinutes.errors ||
              endSeconds.errors) && (
              <Text size="xs" c={"red"}>
                開始時間は終了時間より前に設定してください
              </Text>
            )}
          </Stack>

          <Button
            loading={isSubmitting}
            loaderProps={{ type: "oval" }}
            fullWidth
            type="submit"
          >
            切り抜きをシェア
          </Button>
        </Stack>
      </Form>
    </Modal>
  );
}
