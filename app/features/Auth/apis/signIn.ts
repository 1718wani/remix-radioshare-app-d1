import type { AppLoadContext } from "@remix-run/cloudflare";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { AuthorizationError } from "remix-auth";
import { users } from "~/drizzle/schema.server";

export async function signIn(
	email: string,
	password: string,
	context: AppLoadContext,
) {
	const db = drizzle(context.cloudflare.env.DB);
	const user = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.execute()
		.then((rows) => rows[0]);

	if (!user) {
		throw new AuthorizationError();
	}

	const passwordsMatch = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!passwordsMatch) {
		throw new AuthorizationError();
	}

	return user.id;
}
