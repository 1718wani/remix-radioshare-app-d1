import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/features/Auth/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	await authenticator.logout(request, { redirectTo: "/logout-callback" });
};
