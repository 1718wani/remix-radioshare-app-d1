import { z } from "zod";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";

export const schemaForHighlightShare = (
	radioshowsData: { label: string; value: string }[] | undefined,
) => {
	if (!radioshowsData) {
		return z.never();
	}

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
						/^https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|www\.youtube\.com\/live\/)/.test(
							url,
						),
					{
						message: "URLはSpotifyまたはYouTubeのものである必要があります",
					},
				),
			radioshowData: z
				.string({ required_error: "番組名は必要です" })
				.min(1, "番組名は少なくとも1文字以上である必要があります")
				.refine(
					(value) => radioshowsData.some((show) => show.label === value),
					{
						message: "選択された番組名は一覧に含まれていません",
					},
				)
				.transform((value) => {
					const matchingShow = radioshowsData.find(
						(show) => show.label === value,
					);
					return matchingShow ? matchingShow.value : undefined;
				}),
			startHours: z.string({
				required_error: "開始時間（時）を入力してください",
			}),
			startMinutes: z.string({
				required_error: "開始時間（分）を入力してください",
			}),
			startSeconds: z.string({
				required_error: "開始時間（秒）を入力してください",
			}),
			endHours: z.string({
				required_error: "終了時間（時）を入力してください",
			}),
			endMinutes: z.string({
				required_error: "終了時間（分）を入力してください",
			}),
			endSeconds: z.string({
				required_error: "終了時間（秒）を入力してください",
			}),
		})
		.refine(
			(args) => {
				const startSecondsData = convertHHMMSSToSeconds(
					`${args.startHours}:${args.startMinutes}:${args.startSeconds}`,
				);
				const endSecondsData = convertHHMMSSToSeconds(
					`${args.endHours}:${args.endMinutes}:${args.endSeconds}`,
				);
				return (startSecondsData ?? 0) < (endSecondsData ?? 0);
			},
			{
				message: "終了時間は開始時間よりあとの時間にしてください",
				path: ["endSeconds"],
			},
		);
};
