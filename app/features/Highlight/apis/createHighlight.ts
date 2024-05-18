import { createHighlightType } from "../types/createHighlightType";
import { drizzle } from "drizzle-orm/d1";
import { AppLoadContext, json } from "@remix-run/cloudflare";
import { highlights } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/auth.server";

export const createHighlight = async (
  formData: createHighlightType,
  request: Request,
  context: AppLoadContext
) => {
  try {
    const {
      title,
      description,
      replayUrl,
      radioshowData,
      startSeconds,
      endSeconds,
    } = formData;
    const userId = await authenticator.isAuthenticated(request);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const db = drizzle(context.cloudflare.env.DB);
    await db
      .insert(highlights)
      .values({
        title,
        description,
        replayUrl,
        createdBy: userId,
        radioshowId: radioshowData,
        replayStartTime: startSeconds,
        replayEndTime: endSeconds,
      })
      .execute();

    return json({ message: "Highlight created successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return json({ message: "An error occurred" }, { status: 500 });
  }
};
