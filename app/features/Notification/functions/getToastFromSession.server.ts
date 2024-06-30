import { getSession } from "~/features/Auth/session.server";
import { FLASH_COOKIE_NAME_AS_TOAST } from "../consts/flashCookieNameAsToast";
import type { NotificationFlagType } from "../hooks/useToastNotifications";

export const getToastFromSession = async (request: Request) => {
	const session = await getSession(request.headers.get("cookie"));
	const toastMessage: NotificationFlagType | null =
		session.get(FLASH_COOKIE_NAME_AS_TOAST) ?? null;
	return {
		toastMessage,
		session,
	};
};
