import { z } from "zod";

export const schemaForHighlightShare = (
  radioshowsData: { label: string; value: string }[]
) => {
  return z.object({
    title: z.string({ required_error: "タイトルは必要です" }),
    description: z.string().default("").optional(),
    replayUrl: z
      .string({ required_error: "再生用URLが必要です" })
      .url({ message: "再生用URLは有効なURL形式である必要があります" }),
    radioshowData: z
      .string({ required_error: "番組名は必要です" })
      .min(1, "番組名は少なくとも1文字以上である必要があります")
      .refine((value) => radioshowsData.some((show) => show.label === value), {
        message: "選択された番組名は一覧に含まれていません",
      })
      // ステップ2: バリデーション成功後に値を変換
      .transform((value) => {
        // `radioshowsData`から対応する`value`（ID）を見つける
        const matchingShow = radioshowsData.find(
          (show) => show.label === value
        );
        // 見つかった場合はその`value`（ID）を返す
        return matchingShow ? matchingShow.value : undefined;
      }),
  });
};
