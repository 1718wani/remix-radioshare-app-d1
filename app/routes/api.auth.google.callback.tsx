// app/routes/auth/google/callback.tsx

import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/features/Auth/services/auth.server";
import { setToastInSession } from "~/features/Notification/functions/setToastInSession.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const userId = await authenticator.authenticate("google", request, {
    context: context,
  });

  if (!userId) {
    return redirect("/");
  }

  const headers = await setToastInSession(request, "UserLogin",userId);

  return redirect("/highlights/all", {
    headers,
  });
};
