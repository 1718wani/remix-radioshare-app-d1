// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  json,
  useLoaderData,
  useMatches,
  Form,
  useNavigate,
} from "@remix-run/react";
import {
  ColorSchemeScript,
  LoadingOverlay,
  MantineProvider,
  AppShell,
  ScrollArea,
  Divider,
  NavLink,
  Button,
} from "@mantine/core";
import { HeaderComponent } from "./components/HeaderComponent";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconBookmark,
  IconLogin2,
  IconLogout,
  IconMusicPlus,
  IconRadio,
} from "@tabler/icons-react";
import { getRadioshows } from "./features/Radioshow/apis/getRadioshows";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "./features/Auth/services/auth.server";
import { LoginNavigateModal } from "./features/Auth/components/LoginNavigateModal";
import { useAtom } from "jotai";
import { menuOpenedAtom } from "./features/Player/atoms/menuOpendAtom";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const radioShows = await getRadioshows(context, 0);
  const user = await authenticator.isAuthenticated(request, {});

  if (!radioShows) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ radioShows, user });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </MantineProvider>
      </body>
    </html>
  );
}

export default function App() {
  const { radioShows, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [menuOpened, setMenuOpened] = useAtom(menuOpenedAtom);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 48em)");

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";

  // ちらつき防止に遅延させて
  useEffect(() => {
    let timeoutId: number;
    if (navigation.state === "loading") {
      timeoutId = window.setTimeout(() => setShowLoadingOverlay(true), 200);
    } else {
      // navigation.stateが"loading"ではない場合、LoadingOverlayを即座に非表示にする
      setShowLoadingOverlay(false);
    }

    // コンポーネントのアンマウント時、またはnavigation.stateが変更された時にタイマーをクリアする
    return () => clearTimeout(timeoutId);
  }, [navigation.state]);
  return (
    <>
      <LoadingOverlay
        visible={showLoadingOverlay}
        zIndex={2000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "blue", type: "bars" }}
      />
      <Notifications />

      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 350,
          breakpoint: "sm",
          collapsed: { mobile: !menuOpened },
        }}
      >
        <AppShell.Header>
          <div>
            <HeaderComponent opened={menuOpened} />
          </div>
        </AppShell.Header>

        <AppShell.Navbar
          p="xs"
          style={{
            ...(isMobile ? { zIndex: 203 } : {}),
          }}
        >
          <NavLink
            href="/"
            label="一覧"
            leftSection={<IconRadio stroke={2} />}
            active={currentPath === "/highlights/all"}
          />
          <NavLink
            href="/highlights/saved"
            label="保存済み"
            leftSection={<IconBookmark stroke={2} />}
            active={currentPath === "/highlights/saved"}
          />
          <Divider my="sm" />
          <ScrollArea style={{ height: "72%" }}>
            {radioShows.map((show) => (
              <NavLink
                key={show.id}
                href={`/highlights/${show.id}`}
                label={show.title}
                active={currentPath === `/highlights/${show.id}`}
              />
            ))}
          </ScrollArea>
          <Divider my="sm" />

          <Button
            mt={"sm"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                console.log("開いている");
                openModal();
              } else {
                navigate("/create");
              }
            }}
            w="100%"
            bg={"blue.5"}
            mb={"sm"}
          >
            <IconMusicPlus stroke={2} />
            <span style={{ marginLeft: 4 }}>番組登録</span>
          </Button>
          {user ? (
            <Form action="/logout" method="post" style={{ margin: 0 }}>
              <Button type="submit" w="100%" bg={"gray.5"}>
                <IconLogout stroke={2} />
                <span style={{ marginLeft: 4 }}>ログアウト</span>
              </Button>
            </Form>
          ) : (
            <Form
              onClick={() => {
                navigate("/signin");
                setMenuOpened((prev) => !prev);
              }}
              style={{ margin: 0 }}
            >
              <Button w="100%" bg={"gray.5"}>
                <IconLogin2 stroke={2} />
                <span style={{ marginLeft: 4 }}>ログイン</span>
              </Button>
            </Form>
          )}
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      <LoginNavigateModal opened={modalOpened} close={closeModal} />
    </>
  );
}
