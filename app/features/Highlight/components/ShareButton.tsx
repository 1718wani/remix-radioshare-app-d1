import { Button } from "@mantine/core";
import {
  useNavigate,
  useRouteLoaderData,
} from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import classes from "../../../styles/pulseNewButton.module.css";
import { loader } from "~/routes/highlights";

export const ShareButton = () => {
  const data = useRouteLoaderData<typeof loader>("routes/highlights");
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={(e) => {
          if (!data?.userId) {
            e.preventDefault();
            console.log("開いている");
            open();
          } else {
            navigate("/highlight-share");
          }
        }}
        className={"pulse-new-button"}
        size="md"
        variant="white"
        radius={"md"}
        // style={{ position: "fixed", right: 30, bottom: 50, zIndex: 3 }}
        key={classes.pulse}
      >
        Share
      </Button>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
};
