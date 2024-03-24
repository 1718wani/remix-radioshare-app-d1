import { AppLoadContext, json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userHighlights } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/authenticator";

type SetValuesType = {
  replayed?: boolean;
  saved?: boolean;
  liked?: boolean;
};

export const updateHighlight = async (
  highlightId: string,
  context: AppLoadContext,
  request: Request,
  replayed?: boolean,
  saved?: boolean,
  liked?: boolean
) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) {
    return { error: "User not authenticated", authenticated: false };
  }

  try {
    const db = drizzle(context.cloudflare.env.DB);
    const setValues: SetValuesType = {};
    if (replayed !== undefined) setValues.replayed = replayed;
    if (saved !== undefined) setValues.saved = saved;
    if (liked !== undefined) setValues.liked = liked;
    await db
      .insert(userHighlights)
      .values({
        userId: userId,
        highlightId: highlightId,
        replayed: replayed ?? false,
        saved: saved ?? false,
        liked: liked ?? false,
      })
      .onConflictDoUpdate({
        target: [userHighlights.userId, userHighlights.highlightId],
        set: setValues,
      })
      .execute();
    return json({ status: 204 });
  } catch (error) {
    console.error(error);
    throw new Response("ハイライト情報更新に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
