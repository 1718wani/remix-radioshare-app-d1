import { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/features/Auth/services/authenticator";
import { destroySession, getSession } from "~/features/Auth/sessionStrage";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
  const session = await getSession(request.headers.get("cookie"));
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export const loader = async () => {
  return redirect("/");
};
