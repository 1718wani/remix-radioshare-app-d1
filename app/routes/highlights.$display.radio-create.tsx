import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  rem,
  Modal,
  Stack,
  TextInput,
  FileInput,
  Button,
  Image,
  AspectRatio,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionFunctionArgs,
  MetaFunction,
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import { IconPhoto } from "@tabler/icons-react";
import { useState } from "react";
import { useToastForFormAction } from "~/features/Notification/hooks/useToastForFormAction";
import { createRadioshow } from "~/features/Radioshow/apis/createRadioshow";
import { radioshowCreateschema } from "~/features/Radioshow/types/radioshowCreateSchema";
import { loader as highlightsLoader } from "~/routes/highlights.$display";

export const meta: MetaFunction = () => {
  return [
    { title: "切り抜きシェア | RadiShare" },
    { name: "description", content: "新しいラジオ番組を登録するページです。" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, {
    schema: radioshowCreateschema,
  });

  if (submission.status !== "success") {
    return json({
      success: false,
      message: "データの形式にあっていません",
      submission: submission.reply(),
    });
  }

  const radioshowData = submission.value;

  // R2に画像をアップロードしてURLを取得
  const env = context.cloudflare.env as Env;

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 1024 * 1024 * 10,
  });

  // requestをクローンして使用
  const form = await unstable_parseMultipartFormData(
    request.clone(),
    uploadHandler
  );
  const file = form.get("headerImage");

  if (!file) {
    return json({ success: false, message: "File upload failed" });
  }

  const response = await env.BUCKET.put(
    `${radioshowData.title}${new Date().toISOString()}.png`,
    file
  );

  await createRadioshow(
    { title: radioshowData.title, imageUrl: response?.key ?? "" },
    context,
    request
  );

  return json({ success: true, message: "番組登録が完了しました" });
}

export default function RadioshowCreate() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [form, { title, headerImage }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: radioshowCreateschema });
    },
  });
  const [opened, { close }] = useDisclosure(true);
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.formAction ===
    `/highlights/${highlightLoaderData?.display}/radio-create`;
  const actionData = useActionData<typeof action>();

  const handleCloseModal = () => {
    close();
    navigate(`/highlights/${highlightLoaderData?.display}`);
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  useToastForFormAction({ actionData });

  const icon = (
    <IconPhoto style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );
  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="番組名を登録してください"
        size={"lg"}
      >
        <Form
          method="post"
          encType="multipart/form-data"
          {...getFormProps(form)}
        >
          <Stack gap="md" mx={"xl"}>
            <TextInput
              {...getInputProps(title, { type: "text" })}
              name="title"
              label="番組タイトル"
              placeholder="番組名"
              error={title.errors}
              size="md"
            />
            <FileInput
              name="headerImage"
              leftSection={icon}
              accept="image/png,image/jpeg,image/jpg"
              label="ヘッダー画像"
              placeholder="画像を選択してください"
              error={headerImage.errors}
              size="md"
              onChange={handleFileChange}
            />
            {previewImage && (
              <AspectRatio ratio={24 / 9} >
                <Image
                  src={previewImage}
                  alt="Header image preview"
                  fit="contain"
                  radius="md"
                />
              </AspectRatio>
            )}
            <Button
              loading={isSubmitting}
              loaderProps={{ type: "oval" }}
              fullWidth
              type="submit"
              size="md"
            >
              新規登録
            </Button>
          </Stack>
        </Form>
      </Modal>
    </>
  );
}
