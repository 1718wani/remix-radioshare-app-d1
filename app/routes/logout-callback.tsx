import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getSession, commitSession } from "~/features/Auth/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("cookie"));
  session.flash("logoutFlag", `User Logout`);
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  console.log("これ呼ばれる？", session.data);

  return redirect("/highlights/all", {
    headers,
  });
};
