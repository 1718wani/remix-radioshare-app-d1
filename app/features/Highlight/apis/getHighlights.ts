import { AppLoadContext } from "@remix-run/cloudflare";
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  highlights,
  radioshows,
  userHighlights,
} from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/auth.server";

export const getHighlights = async (
  context: AppLoadContext,
  request: Request,
  offset: number,
  limit: number,
  ascOrDesc: "asc" | "desc" | string,
  orderBy:
    | "totalReplayTimes"
    | "totalLikedTimes"
    | "totalSavedTimes"
    | "createdAt"
    | string,
  pick?: "saved" | "liked" | "notReplayed" | "all",
  radioshowId?: string
) => {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const userId = await authenticator.isAuthenticated(request);
    const orderByQuery =
      orderBy === "totalReplayTimes"
        ? highlights.totalReplayTimes
        : highlights.createdAt;
    const query = db
      .select({
        highlight: {
          id: highlights.id,
          title: highlights.title,
          replayUrl: highlights.replayUrl,
          totalReplayTimes: highlights.totalReplayTimes,
          description: highlights.description,
          radioshowId: highlights.radioshowId,
          createdAt: highlights.createdAt,
          createdBy: highlights.createdBy,
          startHHmmss: highlights.replayStartTime,
          endHHmmss: highlights.replayEndTime,
        },
        radioshow: {
          imageUrl: radioshows.imageUrl,
        },
        userHighlight: {
          replayed: userHighlights.replayed,
          liked: userHighlights.liked,
          saved: userHighlights.saved,
        },
      })
      .from(highlights)
      .leftJoin(radioshows, eq(highlights.radioshowId, radioshows.id))
      .leftJoin(
        userHighlights,
        and(
          eq(highlights.id, userHighlights.highlightId),
          eq(userHighlights.userId, userId ?? "")
        )
      );

    // pickの値に応じてフィルタリングする条件を追加
    if (pick) {
      switch (pick) {
        case "saved":
          query.where(eq(userHighlights.saved, true));
          break;
        case "liked":
          query.where(eq(userHighlights.liked, true));
          break;
        case "notReplayed":
          query.where(eq(userHighlights.replayed, false));
          break;
        case "all":
          break;
        default:
          break;
      }
    }

    // radioshowIdが指定されている場合、そのIDに合致するハイライトのみを取得
    if (radioshowId) {
      query.where(eq(highlights.radioshowId, radioshowId));
    }

    // ソートとページネーションの設定
    query
      .orderBy(ascOrDesc === "asc" ? asc(orderByQuery) : desc(orderByQuery))
      .limit(limit)
      .offset(offset);

    const result = await query.execute();

    return result;
  } catch (error) {
    console.error(error);
    throw new Response("ハイライト取得に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
