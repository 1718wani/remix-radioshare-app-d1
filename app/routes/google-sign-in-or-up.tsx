import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/features/Auth/services/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  console.log("googleのactionが起動された");
  await authenticator.authenticate("google", request, {
    context: context,
  });

  return redirect("/highlights/all", {});
}
