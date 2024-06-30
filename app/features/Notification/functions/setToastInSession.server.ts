import { authenticator } from "~/features/Auth/services/auth.server";
import { commitSession, getSession } from "~/features/Auth/session.server";
import { FLASH_COOKIE_NAME_AS_TOAST } from "../consts/flashCookieNameAsToast";
import type { NotificationFlagType } from "../hooks/useToastNotifications";

export const setToastInSession = async (
	request: Request,
	notificationFlag: NotificationFlagType,
	userId?: string,
) => {
	const session = await getSession(request.headers.get("cookie"));
	if (userId) {
		session.set(authenticator.sessionKey, userId);
	}
	session.flash(FLASH_COOKIE_NAME_AS_TOAST, notificationFlag);
	const headers = new Headers({ "Set-Cookie": await commitSession(session) });
	return headers;
};
