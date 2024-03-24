import { AppLoadContext } from "@remix-run/cloudflare";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  highlights,
  radioshows,
  userHighlights,
} from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/authenticator";

export const getSavedHighlights = async (
  context: AppLoadContext,
  request: Request,
  offset: number
) => {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const userId = await authenticator.isAuthenticated(request);
    console.log("userId:", userId);
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
      .where(eq(userHighlights.saved, true))
      .orderBy(desc(userHighlights.createdAt))
      .limit(30)
      .offset(offset)
      .execute();
    console.log("result:", result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Response("ハイライト取得に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
