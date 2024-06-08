import { Button } from "@mantine/core";
import { useRouteLoaderData } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import classes from "../../../styles/pulseNewButton.module.css";
import { useAtom } from "jotai";
import { isShareHighlightModalOpenAtom } from "~/features/Player/atoms/isShareHighlightModalOpenAtom";
import { loader } from "~/root";
import { isSideMenuOpenAtom } from "~/features/Player/atoms/isSideMenuOpenAtom";
import { IconPencilPlus } from "@tabler/icons-react";

export const ShareButton = () => {
  const data = useRouteLoaderData<typeof loader>("root");
  const [opened, { open, close }] = useDisclosure(false);
  const [, setIsShareHighlightModalOpen] = useAtom(
    isShareHighlightModalOpenAtom
  );
  const [, setMenuOpen] = useAtom(isSideMenuOpenAtom);

  return (
    <>
      <Button
        leftSection={<IconPencilPlus stroke={2} />}
        onClick={(e) => {
          if (!data?.user) {
            e.preventDefault();
            console.log("開いている",data);
            
            open();
          } else {
            setMenuOpen(false);
            setIsShareHighlightModalOpen(true);
          }
        }}
        className={"pulse-new-button"}
        size="md"
        variant="white"
        radius={"md"}
        key={classes.pulse}
      >
        投稿
      </Button>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
};
