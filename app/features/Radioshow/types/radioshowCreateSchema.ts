import { type ZodObject, z } from "zod";

export const radioshowCreateschema: ZodObject<{
	title: z.ZodString;
	headerImage: z.ZodEffects<z.ZodType<File, z.ZodTypeDef, File>>;
}> = z.object({
	title: z.string({ required_error: "タイトルは必要です" }),
	headerImage: z

		.instanceof(File, { message: "画像ファイルを選択してください" })
		.transform((file) => file)
		.refine((file) => file.size < 5 * 1024 * 1024, {
			message: "ファイルサイズは最大5MBです",
		})
		.refine(
			(file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
			{
				message: ".jpeg .jpgもしくは.pngのみ可能です",
			},
		),
});
