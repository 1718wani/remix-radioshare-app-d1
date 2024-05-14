import { Authenticator } from "remix-auth";
import { sessionStorage } from "../session.server";
import { FormStrategy } from "remix-auth-form";
import { signIn } from "../apis/signIn";
import { AppLoadContext } from "@remix-run/cloudflare";

export const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    console.log("authenticatorが発動しました");
    const email = form.get("email");
    const password = form.get("password");
    console.log(email, password, "Emailとパスワード");
    const userId = await signIn(
      String(email),
      String(password),
      context as AppLoadContext
    );
    return userId;
  }),
  "user-signin"
);
