import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  redirect,
  json
} from "@remix-run/cloudflare";
import { createRadioshow } from "~/features/Radioshow/apis/createRadioshow";
import { radioshowCreateschema } from "~/features/Radioshow/components/RadioshowCreateModal";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: radioshowCreateschema });
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
