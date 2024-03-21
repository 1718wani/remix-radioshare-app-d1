import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/features/Auth/services/authenticator";
import { destroySession, getSession } from "~/features/Auth/sessionStrage";

export const action: ActionFunction = async ({
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

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
