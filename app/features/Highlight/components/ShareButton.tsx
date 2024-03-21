import { Button } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import "./ShareButton.module.css";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";

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
        className="pulse-button"
        size="lg"
        variant="filled"
        radius={"lg"}
        style={{ position: "fixed", right: 30, bottom: 50, zIndex: 1000 }}
      >
        Share
      </Button>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
};
