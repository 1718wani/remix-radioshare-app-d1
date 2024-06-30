import type { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { radioshows } from "~/drizzle/schema.server";

export const getRadioshowIdByTitle = async (
	title: string,
	context: AppLoadContext,
) => {
	try {
		const db = drizzle(context.cloudflare.env.DB);
		const radioshowId = await db
			.select({ id: radioshows.id })
			.from(radioshows)
			.where(eq(radioshows.title, title))
			.execute()
			.then((rows) => rows[0]);

		return radioshowId;
	} catch (error) {
		console.error(error);
		throw new Response("ラジオ情報取得に伴ってエラーが発生しました", {
			status: 500,
		});
	}
};
