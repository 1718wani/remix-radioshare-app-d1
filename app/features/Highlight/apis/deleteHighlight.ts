import { AppLoadContext, json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { highlights, userHighlights } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";

export const deleteHighlight = async (
  highlightId: string,
  context: AppLoadContext
) => {
   try {
    const db = drizzle(context.cloudflare.env.DB);

    // userHighlightsを先に削除
    await db
      .delete(userHighlights)
      .where(eq(userHighlights.highlightId, highlightId));

    // highlightsを削除
    const result = await db
      .delete(highlights)
      .where(eq(highlights.id, highlightId))
      .returning();

    return json(
      { message: `Highlight ${result[0].title} deleted successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return json({ message: "An error occurred" }, { status: 500 });
  }
};
