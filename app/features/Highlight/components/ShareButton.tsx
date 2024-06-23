import { Button } from "@mantine/core";
import { useLocation, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { useAtom } from "jotai";
import { loader } from "~/root";
import { isSideMenuOpenAtom } from "~/features/Player/atoms/isSideMenuOpenAtom";
import { IconPencilPlus } from "@tabler/icons-react";

export const ShareButton = () => {
  const data = useRouteLoaderData<typeof loader>("root");
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [, setMenuOpen] = useAtom(isSideMenuOpenAtom);

  return (
    <>
      <Button
        aria-label="新しく切り抜きを投稿"
        leftSection={<IconPencilPlus stroke={2} />}
        onClick={(e) => {
          if (!data?.user) {
            e.preventDefault();
            open();
          } else {
            setMenuOpen(false);
            navigate(`${pathname}/highlight-create`);
          }
        }}
        className={"pulse-new-button"}
        size="md"
        variant="white"
        radius={"md"}
      >
        投稿
      </Button>

      <LoginNavigateModal opened={opened} close={close} />
    </>
  );
};
