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
  useRouteError,
  Link,
  useRouteLoaderData,
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
  Center,
  Stack,
  Title,
  Text,
  Image,
} from "@mantine/core";
import { HeaderComponent } from "./components/HeaderComponent";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconBookmark,
  IconLogout2,
  IconMusicPlus,
  IconRadio,
} from "@tabler/icons-react";
import { getRadioshows } from "./features/Radioshow/apis/getRadioshows";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "./features/Auth/services/auth.server";
import { LoginNavigateModal } from "./features/Auth/components/LoginNavigateModal";
import { useAtom } from "jotai";
import { isSideMenuOpenAtom } from "./features/Player/atoms/isSideMenuOpenAtom";
import { GoogleButton } from "./features/Auth/components/GoogleButton";
import { getToastFromSession } from "./features/Notification/functions/getToastFromSession.server";
import { commitSession } from "./features/Auth/session.server";
import { useToastNotifications } from "./features/Notification/hooks/useToastNotifications";
import { loader as highlightsLoader } from "~/routes/highlights.$display";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const radioShows = await getRadioshows(context, 0);
  const { toastMessage, session } = await getToastFromSession(request);
  const user = await authenticator.isAuthenticated(request, {});

  if (!radioShows) {
    throw new Response("Not Found", { status: 404 });
  }

  return json(
    { radioShows, user, toastMessage },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <>
      <Center my={"xl"}>
        <Stack>
          <Center>
            <Title order={2}>エラーが発生しました!</Title>
          </Center>

          <Center>
            <Link to="/highlights/all" style={{ textDecoration: "none" }}>
              <Text
                size="sm"
                variant="gradient"
                fw={700}
                gradient={{ from: "blue", to: "blue.3" }}
              >
                一覧に戻る
              </Text>
            </Link>
          </Center>
          <Image
            width="120"
            height="auto"
            fit="cover"
            src="/errorgirlwithneko.png"
            alt="success"
          />
        </Stack>
      </Center>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no"
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="49980e45-bfa5-43c2-b62f-b84d2c376148"
        ></script>
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
  const { radioShows, user, toastMessage } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [menuOpened, setMenuOpened] = useAtom(isSideMenuOpenAtom);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 48em)");
  const navigate = useNavigate();

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";

  useToastNotifications(toastMessage);
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );

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
                navigate(
                  `/highlights/${highlightLoaderData?.display}/radio-create`
                );
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
              <Button
                type="submit"
                onClick={() => setMenuOpened(false)}
                w="100%"
                bg={"gray.5"}
              >
                <IconLogout2 stroke={2} />
                <span style={{ marginLeft: 4 }}>ログアウト</span>
              </Button>
            </Form>
          ) : (
            <Form
              method="post"
              action="/google-sign-in-or-up"
              style={{ margin: 0 }}
            >
              <GoogleButton
                type="submit"
                onClick={() => setMenuOpened(false)}
                my={"xs"}
                w={"100%"}
              >
                Googleアカウントで ログイン or 登録
              </GoogleButton>
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
