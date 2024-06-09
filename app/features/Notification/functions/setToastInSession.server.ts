import { commitSession, getSession } from "~/features/Auth/session.server";
import { NotificationFlagType } from "../hooks/useToastNotifications";
import { authenticator } from "~/features/Auth/services/auth.server";
import { FLASH_COOKIE_NAME_AS_TOAST } from "../consts/flashCookieNameAsToast";

export const setToastInSession = async (
  request: Request,
  notificationFlag: NotificationFlagType,
  userId?: string
) => {
  console.log("setToastInSessionで受け取ったuserId", userId);
  const session = await getSession(request.headers.get("cookie"));
  if (userId) {
    session.set(authenticator.sessionKey, userId);
  }
  session.flash(FLASH_COOKIE_NAME_AS_TOAST, notificationFlag);
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  return headers;
};
