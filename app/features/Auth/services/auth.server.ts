import { Authenticator } from "remix-auth";
import { sessionStorage } from "../session.server";
import { FormStrategy } from "remix-auth-form";
import { signIn } from "../apis/signIn";
import { AppLoadContext } from "@remix-run/cloudflare";
import { GoogleStrategy } from "remix-auth-google";
import { getUserIdByEmail } from "../apis/getUserIdByEmail";
import { createUserWithoutPassoword } from "../apis/createUserWithoutPassword";

export const authenticator = new Authenticator<string>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form, context }) => {
  const email = form.get("email");
  const password = form.get("password");
  console.log(email, password, "Emailとパスワード");
  const userId = await signIn(
    String(email),
    String(password),
    context as AppLoadContext
  );
  return userId;
});

authenticator.use(formStrategy, "user-signin");

if (
  !(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.CLIENT_URL
  )
) {
  throw new Error(
    "GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、CLIENT_URLが設定されていません。"
  );
}

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: `${process.env.CLIENT_URL}/api/auth/google/callback`,
  },
  async ({ profile, context }) => {
    console.log("GoogleStrategy",profile,context);
    const userId = await getUserIdByEmail(
      profile.emails[0].value,
      context as AppLoadContext
    );

    console.log("userId", userId);

    if (userId) {
      return userId;
    }

    const newUser = await createUserWithoutPassoword(
      profile,
      context as AppLoadContext
    );

    return newUser?.id;
  }
);

authenticator.use(googleStrategy);
