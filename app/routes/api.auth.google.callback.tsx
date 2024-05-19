// app/routes/auth/google/callback.tsx

import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/features/Auth/services/auth.server";
import { commitSession, getSession } from "~/features/Auth/session.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const userId =  await authenticator.authenticate("google", request, {
    // successRedirect: "/highlights/all",
    // failureRedirect: "/signin",
    context: context,
  });

  if (!userId) {
    return redirect("/");
  }

  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, userId);
  session.flash("googleAuthFlag", `User Created`);

  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
 
  return redirect("/highlights/all", {
    headers
  });
};
