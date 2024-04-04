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
  IconRadio,
} from "@tabler/icons-react";
import { getRadioshows } from "./features/Radioshow/apis/getRadioshows";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "./features/Auth/services/authenticator";

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
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 48em)");

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";
  console.log(currentPath, "currentpath");

  // ちらつき防止
  useEffect(() => {
    let timeoutId: number;
    if (navigation.state === "loading") {
      // navigation.stateが"loading"になったら、0.3秒後にLoadingOverlayを表示する
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
        zIndex={1500}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "blue", type: "bars" }}
      />
      <Notifications />

      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Header>
          <div>
            <HeaderComponent opened={opened} toggle={toggle} />
          </div>
        </AppShell.Header>

        <AppShell.Navbar
          p="xs"
          style={{
            ...(isMobile ? { zIndex: 201 } : {}),
          }}
        >
          <NavLink
            href="/"
            label="一覧"
            leftSection={<IconRadio stroke={2} />}
            active={currentPath === "/highlights/popular"}
          />
          <NavLink
            href="/highlights/saved"
            label="保存済み"
            leftSection={<IconBookmark stroke={2} />}
            active={currentPath === "/highlights/saved"}
          />

          <Divider my="sm" />
          <ScrollArea style={{ height: "80%" }}>
            {radioShows.map((show) => (
              <NavLink
                key={show.id}
                href={`/${show.id}`}
                label={show.title}
                active={currentPath === `/${show.id}`}
              />
            ))}
          </ScrollArea>
          <Divider my="sm" />
          {user ? (
            <Form action="/logout" method="post" style={{ margin: 0 }}>
              <Button type="submit" w="100%" bg={"gray.4"}>
                <IconLogout stroke={2} />
                <span style={{ marginLeft: 4 }}>ログアウト</span>
              </Button>
            </Form>
          ) : (
            <Form
              onClick={() => {
                navigate("/signin");
                toggle();
              }}
              style={{ margin: 0 }}
            >
              <Button w="100%" bg={"gray.4"}>
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
    </>
  );
}
