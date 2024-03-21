import { Authenticator } from "remix-auth";
import { sessionStorage } from "../sessionStrage";
import { FormStrategy } from "remix-auth-form";
import { signIn } from "../apis/signIn";

export const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    const userId = await signIn(String(email), String(password));
    return userId;
  }),
  "user-signin"
);
