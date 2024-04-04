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
} from "@remix-run/react";
import {
  ColorSchemeScript,
  LoadingOverlay,
  MantineProvider,
  AppShell,
  NavLink,
  ScrollArea,
  Divider,
  SegmentedControl,
} from "@mantine/core";
import { HeaderComponent } from "./components/HeaderComponent";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";

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
  const navigation = useNavigation();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [opened, { toggle }] = useDisclosure();

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

        <AppShell.Navbar p="xs">
          <SegmentedControl data={["一覧", "保存済み"]} />

          <Divider my="sm" />
          <ScrollArea style={{ height: "85%" }}>
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" active />
            <NavLink href="#required-for-focus" label="Active light" />
            <NavLink href="#required-for-focus" label="Active light" />
          </ScrollArea>
          <Divider my="sm" />
          <NavLink
            href="#required-for-focus"
            label="ログアウト"
            leftSection={<IconLogout />}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
