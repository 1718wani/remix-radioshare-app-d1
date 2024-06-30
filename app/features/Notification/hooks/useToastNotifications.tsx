import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";

export type NotificationFlagType =
	| "UserLogout"
	| "UserLogin"
	| "HighlightDeleted";

export const useToastNotifications = (
	notificationFlag: NotificationFlagType | null,
) => {
	useEffect(() => {
		switch (notificationFlag) {
			case "UserLogout":
				notifications.show({
					withCloseButton: true,
					autoClose: 5000,
					title: "ログアウトしました。",
					message: "",
					color: "blue",
					icon: <IconCheck />,
				});
				break;

			case "UserLogin":
				notifications.show({
					withCloseButton: true,
					autoClose: 5000,
					title: "ログインしました。",
					message: "ようこそ！",
					color: "blue",
					icon: <IconCheck />,
				});
				break;

			case "HighlightDeleted":
				notifications.show({
					withCloseButton: true,
					autoClose: 5000,
					title: "切り抜きを削除しました。",
					message: "",
					color: "blue",
					icon: <IconCheck />,
				});
				break;

			default:
				break;
		}
	}, [notificationFlag]);
};
