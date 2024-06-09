import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect } from "react";

export type NotificationFlagType =
  | "UserCreated"
  | "UserLogout"
  | "UserLogin"
  | "RadioCreated"
  | "HighlightCreated"
  | "HighlightDeleted"
  | "FailedRadioCreation"
  | "FailedHighlightCreation"
  | "FailedLogin";

export const useToastNotifications = (
  notificationFlag: NotificationFlagType | null
) => {
  useEffect(() => {
    switch (notificationFlag) {
      case "UserCreated":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ユーザーが作成されました",
          message: "新しいユーザーが正常に作成されました。",
          color: "blue",
          icon: <IconCheck />,
        });
        break;

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

      case "RadioCreated":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ラジオが作成されました",
          message: "新しいラジオが正常に作成されました。",
          color: "blue",
          icon: <IconCheck />,
        });
        break;

      case "HighlightCreated":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ハイライトが作成されました",
          message: "新しいハイライトが正常に作成されました。",
          color: "blue",
          icon: <IconCheck />,
        });
        break;

      case "HighlightDeleted":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ハイライトが削除されました",
          message: "ハイライトが正常に削除されました。",
          color: "blue",
          icon: <IconCheck />,
        });
        break;

      case "FailedRadioCreation":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ラジオの作成に失敗しました",
          message: "ラジオの作成中にエラーが発生しました。",
          color: "red",
          icon: <IconX />,
        });
        break;

      case "FailedHighlightCreation":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ハイライトの作成に失敗しました",
          message: "ハイライトの作成中にエラーが発生しました。",
          color: "red",
          icon: <IconX />,
        });
        break;

      case "FailedLogin":
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "ログインに失敗しました",
          message: "ログイン中にエラーが発生しました。",
          color: "red",
          icon: <IconX />,
        });
        break;

      default:
        break;
    }
  }, [notificationFlag]);
};
