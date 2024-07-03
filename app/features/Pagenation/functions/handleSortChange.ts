import type { NavigateFunction } from "@remix-run/react";
import type { SortOptionType } from "~/features/Pagenation/types/sortOptionsType";

export const handleSortChange = (
	sortOption: SortOptionType | null,
	display: string,
	navigate: NavigateFunction,
) => {
	let orderBy = "totalReplayTimes"; // デフォルトのソートキー
	let ascOrDesc = "desc"; // デフォルトのソート順

	switch (sortOption) {
		case "再生数順":
			orderBy = "totalReplayTimes";
			ascOrDesc = "desc";
			break;
		case "再生数少順":
			orderBy = "totalReplayTimes";
			ascOrDesc = "asc";
			break;
		case "新しい順":
			orderBy = "createdAt";
			ascOrDesc = "desc";
			break;
		case "古い順":
			orderBy = "createdAt";
			ascOrDesc = "asc";
			break;
		default:
			break;
	}

	navigate(
		`/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=0`,
	);
};
