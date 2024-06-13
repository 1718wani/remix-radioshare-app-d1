import { NavigateFunction } from "@remix-run/react";

export const handleSortChange = (
  sortOption: "再生数順" | "再生数少順" | "新しい順" | "古い順" | null,
  display: string,
  navigate: NavigateFunction
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
  }

  navigate(
    `/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=0`
  );
};
