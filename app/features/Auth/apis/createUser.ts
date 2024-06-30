import { type AppLoadContext, json } from "@remix-run/cloudflare";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/drizzle/schema.server";
import type { RegisterFormType } from "../types/registerFormType";

export const createUser = async (
	user: RegisterFormType,
	context: AppLoadContext,
) => {
	try {
		const { email, password, name } = user;
		const db = drizzle(context.cloudflare.env.DB);
		const passwordHash = await bcrypt.hash(password, 12);
		await db
			.insert(users)
			.values({ email, password: passwordHash, name })
			.execute();
		return json({ message: "Resource added" }, { status: 201 });
	} catch (error) {
		console.error(error);
		return json({ message: "An error occurred" }, { status: 500 });
	}
};
