import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { setToastInSession } from "~/features/Notification/functions/setToastInSession.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const headers = await setToastInSession(request, "UserLogout");
	return redirect("/highlights/all", {
		headers,
	});
};
