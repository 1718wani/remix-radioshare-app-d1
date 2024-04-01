import { AppLoadContext } from "@remix-run/cloudflare";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  highlights,
  radioshows,
  userHighlights,
} from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/authenticator";

export const getLotsReplayedHighlights = async (
  context: AppLoadContext,
  request: Request,
  offset: number,
  limit: number
) => {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const userId = await authenticator.isAuthenticated(request);
    const result = await db
      .select({
        highlight: {
          id: highlights.id,
          title: highlights.title,
          replayUrl: highlights.replayUrl,
          totalReplayTimes: highlights.totalReplayTimes,
          description: highlights.description,
          radioshowId: highlights.radioshowId,
          createdAt: highlights.createdAt,
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
      )
      .orderBy(desc(highlights.totalReplayTimes))
      .limit(limit)
      .offset(offset)
      .execute();

    // // もし取得した値が、限界値と同じ値であれば、ちょうど終わり、もしくはもっとある。
    // const hasNextPage = result.length === limit;
    // // もし次ページもあるのであれば、末尾１つだけ削除して返す。 そうすれば、もし仮にちょうどなら、次はもうhasNextPageとならない。もし普通にそれ以上あるならそのまま返す。
    // // もし次ページがないのなら、そのまま返す。limitとoffsetは同じである必要がある？いや、
    // if (hasNextPage && result.length >= 1  ) result.slice(0, -1);
    return  result ;
  } catch (error) {
    console.error(error);
    throw new Response("ハイライト取得に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
