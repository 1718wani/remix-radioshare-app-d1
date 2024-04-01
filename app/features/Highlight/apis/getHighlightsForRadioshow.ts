import { AppLoadContext } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { highlights, userHighlights } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/authenticator";

export const getHighlightsForRadioshow = async (
  radioshowId: string,
  context: AppLoadContext,
  request: Request,
  offset: number,
  limit: number
) => {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const userId = await authenticator.isAuthenticated(request);
    const highlightsWithUserHighlights = await db
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
        userHighlight: {
          replayed: userHighlights.replayed,
          liked: userHighlights.liked,
          saved: userHighlights.saved,
        },
      })
      .from(highlights)
      .leftJoin(
        userHighlights,
        and(
          eq(highlights.id, userHighlights.highlightId),
          eq(userHighlights.userId, userId ?? "")
        )
      )
      .where(eq(highlights.radioshowId, radioshowId))
      .limit(limit)
      .offset(offset)
      .execute();
    return highlightsWithUserHighlights;
  } catch (error) {
    console.error(error);
    throw new Response("ハイライト取得に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
