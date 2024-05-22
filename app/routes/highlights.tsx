import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { Outlet, useActionData} from "@remix-run/react";
import { useAtom } from "jotai";
import { z } from "zod";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import HighlightShareModal from "~/features/Highlight/components/HighlightShareModal";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";
import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { isRadioshowCreateModalOpenAtom } from "~/features/Player/atoms/isRadioshowCreateModalOpenAtom";
import { isShareHighlightModalOpenAtom } from "~/features/Player/atoms/isShareHighlightModalOpenAtom";
import { createRadioshow } from "~/features/Radioshow/apis/createRadioshow";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import RadioshowCreateModal, {
  radioshowCreateschema,
} from "~/features/Radioshow/components/RadioshowCreateModal";

export const loader = async ({request}: LoaderFunctionArgs) => {
  // もしいまのURLが/highlightsの場合/highlights/allにリダイレクトする
  const url = new URL(request.url);
  if (url.pathname === "/highlights") {
    return redirect("/highlights/success");
  }else{
    return null;
  }
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  if (
    formData.get("title") &&
    formData.get("replayUrl") &&
    formData.get("startSeconds") &&
    formData.get("endSeconds")
  ) {
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
  }

  if (formData.get("title") && formData.get("headerImage")) {
    const submission = parseWithZod(formData, {
      schema: radioshowCreateschema,
    });

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
    if (!env.BUCKET) {
      return json({ success: false, message: "Bucket not found" });
    }
    // const uploadHandler = unstable_createMemoryUploadHandler({
    //   maxPartSize: 1024 * 1024 * 10,
    // });

    // const form = await unstable_parseMultipartFormData(request, uploadHandler);
    // const file = form.get("headerImage");
    // const response = await env.BUCKET.put(
    //   `${radioshowData.title}${new Date().toISOString()}.png`,
    //   file
    // );

    // await createRadioshow(
    //   { title: radioshowData.title, imageUrl: response?.key ?? "" },
    //   context,
    //   request
    // );

    return json({ success: true, message: "番組登録が完了しました" });
  }
}

export type RadioshowData = {
  value: string;
  label: string;
};

export type HighlightShareModalProps = {
  opened: boolean;
  close: () => void;
  data?: SerializeFrom<typeof action>;
};

export type RadioshowCreateModalProps = {
  opened: boolean;
  close: () => void;
  data?: SerializeFrom<typeof action>;
};

export default function Highlights() {
  
  const [isShareHighlightModalOpen, setIsShareHighlightModalOpen] = useAtom(
    isShareHighlightModalOpenAtom
  );
  const [isRadioshowCreateModalOpen, setIsRadioshowCreateModalOpen] = useAtom(
    isRadioshowCreateModalOpenAtom
  );
  const data = useActionData<typeof action>();
  return (
    <div>
      <Outlet />
      <HighlightShareModal
      
        opened={isShareHighlightModalOpen}
        close={() => setIsShareHighlightModalOpen(false)}
        data={data}
      />
      <RadioshowCreateModal
        opened={isRadioshowCreateModalOpen}
        close={() => setIsRadioshowCreateModalOpen(false)}
        data={data}
      />
    </div>
  );
}
