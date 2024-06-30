import type { AppLoadContext } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import { createUserWithoutPassoword } from "../apis/createUserWithoutPassword";
import { getUserIdByEmail } from "../apis/getUserIdByEmail";
import { signIn } from "../apis/signIn";
import { sessionStorage } from "../session.server";

export const authenticator = new Authenticator<string>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form, context }) => {
	const email = form.get("email");
	const password = form.get("password");
	const userId = await signIn(
		String(email),
		String(password),
		context as AppLoadContext,
	);
	return userId;
});

authenticator.use(formStrategy, "user-signin");

if (
	!(
		import.meta.env.VITE_GOOGLE_CLIENT_ID &&
		import.meta.env.VITE_GOOGLE_CLIENT_SECRET &&
		import.meta.env.VITE_CLIENT_URL
	)
) {
	throw new Error(
		"GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、CLIENT_URLが設定されていません。",
	);
}

const googleStrategy = new GoogleStrategy(
	{
		clientID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
		clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
		callbackURL: `${import.meta.env.VITE_CLIENT_URL}/api/auth/google/callback`,
	},
	async ({ profile, context }) => {
		const userId = await getUserIdByEmail(
			profile.emails[0].value,
			context as AppLoadContext,
		);

		if (userId) {
			return userId;
		}

		const newUser = await createUserWithoutPassoword(
			profile,
			context as AppLoadContext,
		);

		return newUser?.id;
	},
);

authenticator.use(googleStrategy);
