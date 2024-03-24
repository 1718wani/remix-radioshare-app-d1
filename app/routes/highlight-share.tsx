import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Autocomplete,
  Button,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authenticator } from "~/features/Auth/services/authenticator";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import { getRadioshows } from "~/features/Radioshow/apis/getRadioshows";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const radioshows = await getRadioshows(context, 0);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  return json({ user, radioshows });
};

export async function action({ request, context }: ActionFunctionArgs) {
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
  console.log(highlightData, "送信されたFormData");

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

  const { radioshows } = useLoaderData<typeof loader>();
  const radioshowsData = radioshows.map((show) => ({
    value: show.id.toString(),
    label: show.title,
  }));

  const data = useActionData<typeof action>();

  const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

  const [form, { title, description, replayUrl, radioshowData }] = useForm({
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

    console.log(data);
    // {
    //   message: <server message>,
    //   submission: typeof SubmissionResult,
    //   success: <boolean>,
    // }

    if (data.success) {
      alert(data.message);
    }
  }, [data]);

  return (
    <>
      <Form method="post" {...getFormProps(form)}>
        <Stack gap="md" mx={"xl"} mt={"lg"}>
          <Title order={2}>ハイライトシェア</Title>
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
          {/* 隠しフィールドを追加して、選択された番組IDを送信 */}
          <input type="hidden" name="radioshowData" value={selectedRadioshow} />

          <TextInput
            {...getInputProps(title, { type: "text" })}
            name="title"
            placeholder="コーナー名/発言の内容など"
            label="タイトル"
            error={title.errors}
            required
          />

          <TextInput
            {...getInputProps(description, { type: "text" })}
            name="description"
            placeholder="ハイライトの説明"
            label="説明"
            error={description.errors}
          />

          <TextInput
            {...getInputProps(replayUrl, { type: "url" })}
            name="replayUrl"
            placeholder="https://example.com"
            label="再生用URL"
            error={replayUrl.errors}
            required
          />
          <Link
            to="/create"
            style={{ textDecoration: "none", width: "fit-content" }}
          >
            <Text
              size="sm"
              variant="gradient"
              fw={700}
              gradient={{ from: "blue", to: "blue.3" }}
            >
              番組名が見つからない場合はこちらから作成してください
            </Text>
          </Link>
          <Button fullWidth type="submit">
            ハイライトをシェア
          </Button>
        </Stack>
      </Form>
    </>
  );
}
