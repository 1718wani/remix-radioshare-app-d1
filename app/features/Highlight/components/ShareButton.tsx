import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useLocation, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { IconPencilPlus } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { LoginNavigateModal } from "~/features/Auth/components/LoginNavigateModal";
import { isSideMenuOpenAtom } from "~/features/Player/atoms/isSideMenuOpenAtom";
import type { loader } from "~/root";

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
					if (data?.user) {
						setMenuOpen(false);
						navigate(`${pathname}/highlight-create`);
					} else {
						e.preventDefault();
						open();
					}
				}}
				class={"pulse-new-button"}
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
