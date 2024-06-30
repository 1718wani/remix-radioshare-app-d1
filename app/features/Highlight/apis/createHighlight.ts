import { type AppLoadContext, json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { highlights } from "~/drizzle/schema.server";
import { authenticator } from "~/features/Auth/services/auth.server";
import type { createHighlightType } from "../types/createHighlightType";

export const createHighlight = async (
	formData: createHighlightType,
	request: Request,
	context: AppLoadContext,
) => {
	try {
		const {
			title,
			description,
			replayUrl,
			radioshowData,
			startSeconds,
			startMinutes,
			startHours,
			endSeconds,
			endMinutes,
			endHours,
		} = formData;
		const userId = await authenticator.isAuthenticated(request);
		if (!userId) {
			throw new Error("User not authenticated");
		}

		const formatTime = (hours: string, minutes: string, seconds: string) => {
			return `${hours}:${minutes}:${seconds}`;
		};

		const replayStartTime = formatTime(startHours, startMinutes, startSeconds);
		const replayEndTime = formatTime(endHours, endMinutes, endSeconds);

		const db = drizzle(context.cloudflare.env.DB);
		await db
			.insert(highlights)
			.values({
				title,
				description,
				replayUrl,
				createdBy: userId,
				radioshowId: radioshowData,
				replayStartTime,
				replayEndTime,
			})
			.execute();

		return json({ message: "Highlight created successfully" }, { status: 201 });
	} catch (error) {
		console.error(error);
		return json({ message: "An error occurred" }, { status: 500 });
	}
};
