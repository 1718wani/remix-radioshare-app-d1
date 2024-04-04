import { Button } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import classes from "../../../styles/pulseNewButton.module.css"

interface shareButtonType  {
   userId: string|null
}

export const ShareButton = (props : shareButtonType) => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={(e) => {
          if (!props.userId) {
            e.preventDefault();
            console.log("開いている");
            open();
          } else {
            navigate("/highlight-share");
          }
        }}
        className={"pulse-new-button"}
        size="lg"
        variant="filled"
        radius={"lg"}
        style={{ position: "fixed", right: 30, bottom: 50, zIndex: 3 }}
        key={classes.pulse}
      >
        Share
      </Button>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
};
