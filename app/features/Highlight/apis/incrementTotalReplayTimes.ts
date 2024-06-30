import type { AppLoadContext } from "@remix-run/cloudflare";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { highlights } from "~/drizzle/schema.server";

export const incrementTotalReplayTimes = async (
	highlightId: string,
	context: AppLoadContext,
) => {
	try {
		const db = drizzle(context.cloudflare.env.DB);
		await db
			.update(highlights)
			.set({
				totalReplayTimes: sql`${highlights.totalReplayTimes} + 1`,
			})
			.where(eq(highlights.id, highlightId))
			.execute();
	} catch (error) {
		console.error(error);
		throw new Response("ハイライトの再生回数更新に伴ってエラーが発生しました", {
			status: 500,
		});
	}
};
