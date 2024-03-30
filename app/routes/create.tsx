import { Button, FileInput, Stack, TextInput, Title, rem } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { authenticator } from "~/features/Auth/services/authenticator";
import { z } from "zod";
import { IconPhoto } from "@tabler/icons-react";
import { Form } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { createRadioshow } from "~/features/Radioshow/apis/createRadioshow";

const schema = z.object({
  title: z.string({ required_error: "タイトルは必要です" }),
  headerImage: z

    .instanceof(File, { message: "画像ファイルを選択してください" })
    .transform((file) => file)
    .refine((file) => file.size < 500 * 1000, {
      message: "ファイルサイズは最大5MBです",
    })
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      {
        message: ".jpeg .jpgもしくは.pngのみ可能です",
      }
    ),
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return json({
      success: false,
      message: "データの送信に失敗しました",
      submission: submission.reply(),
    });
  }

  const radioshowData = submission.value;

  // R2に画像をアップロードしてURLを取得
  const env = context.cloudflare.env as Env;
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 1024 * 1024 * 10,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = form.get("headerImage");
  console.log(file, "file");
  const response = await env.BUCKET.put(
    `${radioshowData.title}${new Date().toISOString()}.png`,
    file
  );

  // const session = await getSession(request.headers.get("cookie"));
  // console.log("sessionの値", session.data.user);
  await createRadioshow(
    { title: radioshowData.title, imageUrl: response?.key ?? "" },
    context,
    request
  );
  return redirect("/");
};


export default function RadioshowCreate() {
  const [form, { title, headerImage }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const icon = (
    <IconPhoto style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );
  return (
    <>
      <Title m={"md"} order={2}>
        新しいラジオ番組登録
      </Title>
      <Form method="POST" encType="multipart/form-data" {...getFormProps(form)}>
        <Stack gap="md" mx={"xl"}>
          <TextInput
            {...getInputProps(title, { type: "text" })}
            name="title"
            label="番組タイトル"
            placeholder="番組名"
            error={title.errors}
          />
          <FileInput
            name="headerImage"
            leftSection={icon}
            accept="image/png,image/jpeg,image/jpg"
            label="ヘッダー画像"
            placeholder="画像を選択してください"
            error={headerImage.errors}
          />
          <Button fullWidth type="submit">
            新規登録
          </Button>
        </Stack>
      </Form>
    </>
  );
}
