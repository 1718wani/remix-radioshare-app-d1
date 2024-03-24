import { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { radioshows } from "~/drizzle/schema.server";

export const getRadioshowById = async (
  radioshowId: string,
  context: AppLoadContext
) => {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const radioshow = await db
      .select()
      .from(radioshows)
      .where(eq(radioshows.id, radioshowId))
      .execute()
      .then((rows) => rows[0]);
    return radioshow;
  } catch (error) {
    console.error(error);
    throw new Response("ラジオID取得に伴ってエラーが発生しました", {
      status: 500,
    });
  }
};
