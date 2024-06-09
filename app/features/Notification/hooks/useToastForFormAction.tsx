import { notifications } from "@mantine/notifications";
import { SerializeFrom } from "@remix-run/cloudflare";
import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { action } from "~/routes/highlights.$display.highlight-create";
import { loader as highlightsLoader } from "~/routes/highlights.$display";

export const useToastForFormAction = ({
  actionData,
}: {
  actionData?: SerializeFrom<typeof action>;
}) => {

  const navigate = useNavigate();
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );

  useEffect(() => {
    if (!actionData) return;
    if (!actionData.message && !actionData.success) return;
    notifications.show({
      withCloseButton: true,
      autoClose: 5000,
      title: actionData.message,
      message: "",
      color: actionData.success ? "blue" : "red",
      icon: actionData.success ? <IconCheck /> : <IconX />,
    });
    if (actionData.success) {
        navigate(`/highlights/${highlightLoaderData?.display}`);
    }


  }, [actionData,navigate,highlightLoaderData]);
};
