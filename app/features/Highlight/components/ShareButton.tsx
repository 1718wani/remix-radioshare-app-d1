import { Button } from "@mantine/core";
import { useRouteLoaderData } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import classes from "../../../styles/pulseNewButton.module.css";
import { useAtom } from "jotai";
import { isShareHighlightModalOpenAtom } from "~/features/Player/atoms/isShareHighlightModalOpenAtom";
import { loader } from "~/root";

export const ShareButton = () => {
  const data = useRouteLoaderData<typeof loader>("root");
  const [opened, { open, close }] = useDisclosure(false);
  const [, setIsShareHighlightModalOpen] = useAtom(
    isShareHighlightModalOpenAtom
  );

  return (
    <>
      <Button
        onClick={(e) => {
          if (!data?.user) {
            e.preventDefault();
            console.log("開いている",data);
            open();
          } else {
            setIsShareHighlightModalOpen(true);
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
