import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import { AuthorizationError } from "remix-auth";
import type { GoogleProfile } from "remix-auth-google";
import { users } from "~/drizzle/schema.server";

export const createUserWithoutPassoword = async (
	profile: GoogleProfile,
	context: AppLoadContext,
) => {
	try {
		const db = drizzle(context.cloudflare.env.DB);
		const result = await db
			.insert(users)
			.values({ email: profile.emails[0].value, name: profile.displayName })
			.returning()
			.execute();
		return result[0];
	} catch (error) {
		throw new AuthorizationError();
	}
};
