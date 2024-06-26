import { type AppLoadContext, json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { radioshows } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/auth.server";
import type { createRadioshowType } from "../types/createRadioshowType";

export const createRadioshow = async (
	formData: createRadioshowType,
	context: AppLoadContext,
	request: Request,
) => {
	try {
		const userId = await authenticator.isAuthenticated(request);
		if (!userId) {
			throw new Error("User not authenticated");
		}
		const { title, imageUrl } = formData;
		const db = drizzle(context.cloudflare.env.DB);
		await db
			.insert(radioshows)
			.values({ title, imageUrl, createdBy: userId })
			.execute();
		return json({ message: "Radioshow added" }, { status: 201 });
	} catch (error) {
		console.error(error);
		return json({ message: "An error occurred" }, { status: 500 });
	}
};
