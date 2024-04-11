import { z } from "zod";

export const schemaForHighlightShare = (
  radioshowsData: { label: string; value: string }[]
) => {
  console.log("バリデーションは実行");
  return z
    .object({
      title: z.string({ required_error: "タイトルは必要です" }),
      description: z.string().default("").optional(),
      replayUrl: z
        .string({ required_error: "再生用URLが必要です" })
        .url({ message: "再生用URLは有効なURL形式である必要があります" })
        .refine(
          (url) =>
            /^https:\/\/open\.spotify\.com\//.test(url) ||
            /^https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)/.test(url),
          {
            message: "URLはSpotifyまたはYouTubeのものである必要があります",
          }
        ),
      radioshowData: z
        .string({ required_error: "番組名は必要です" })
        .min(1, "番組名は少なくとも1文字以上である必要があります")
        .refine(
          (value) => radioshowsData.some((show) => show.label === value),
          {
            message: "選択された番組名は一覧に含まれていません",
          }
        )
        // ステップ2: バリデーション成功後に値を変換
        .transform((value) => {
          // `radioshowsData`から対応する`value`（ID）を見つける
          const matchingShow = radioshowsData.find(
            (show) => show.label === value
          );
          // 見つかった場合はその`value`（ID）を返す
          return matchingShow ? matchingShow.value : undefined;
        }),
      startSeconds: z.string({ required_error: "開始時間を入力してください" }),
      endSeconds: z.string({ required_error: "終了時間を入力してください" }),
    })
    .refine(
      (args) => {
        const { startSeconds, endSeconds } = args;
        const startSecondsData = convertHHMMSSToSeconds(startSeconds);
        const endSecondsData = convertHHMMSSToSeconds(endSeconds);
        return startSecondsData < endSecondsData;
      },
      {
        message: "終了時間は開始時間よりあとの時間にしてください",
        path: ["endSeconds"],
      }
    );
};

const convertHHMMSSToSeconds = (timeString: string) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};
