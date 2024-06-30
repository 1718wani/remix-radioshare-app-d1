import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { radioshows } from "~/drizzle/schema.server";

export const getAllRadioshows = async (context: AppLoadContext) => {
	try {
		const db = drizzle(context.cloudflare.env.DB);
		const allRadioshows = await db.select().from(radioshows).execute();
		return allRadioshows;
	} catch (error) {
		console.error(error);
		throw new Response("ハイライト取得に伴ってエラーが発生しました", {
			status: 500,
		});
	}
};
