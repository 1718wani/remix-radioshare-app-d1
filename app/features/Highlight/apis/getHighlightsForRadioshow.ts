import { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { highlights, userHighlights } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/authenticator";

export const getHighlightsForRadioshow = async (
  radioshowId: string,
  context: AppLoadContext,
  request: Request,
  offset: number
) => {
  const userId = await authenticator.isAuthenticated(request);

  try {
    const db = drizzle(context.cloudflare.env.DB);
    const highlightsWithUserHighlights = await db
      .select()
      .from(highlights)
      .leftJoin(userHighlights, eq(userHighlights.userId, userId ?? ""))
      .where(eq(highlights.radioshowId, radioshowId))
      .limit(30)
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
