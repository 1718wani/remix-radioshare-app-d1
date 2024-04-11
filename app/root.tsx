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
  Paper,
  Box,
} from "@mantine/core";
import { HeaderComponent } from "./components/HeaderComponent";
import { Notifications } from "@mantine/notifications";
import { useEffect, useRef, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconBookmark,
  IconLogin2,
  IconLogout,
  IconMusicPlus,
  IconPlayerPlayFilled,
  IconRadio,
} from "@tabler/icons-react";
import { getRadioshows } from "./features/Radioshow/apis/getRadioshows";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "./features/Auth/services/authenticator";
import { LoginNavigateModal } from "./features/Auth/components/LoginNavigateModal";
import { SpotifyPlayer } from "./features/Player/components/SpotifyPlayer";
import { SpotifyPlayerRef } from "./features/Player/types/SpotifyIframeApiTypes";
import { YoutubePlayer } from "./features/Player/components/YouTubePlayer";

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
  const [menuOpened, { toggle: toggleMenu }] = useDisclosure();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 48em)");

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";
  const [platform, setPlatform] = useState<"Spotify" | "Youtube" | null>(null);

  // SpotifyPlayer コンポーネントへの ref を作成
  const spotifyPlayerRef = useRef<SpotifyPlayerRef>(null);

  const handleSpotifyPlay = () => {
    setPlatform("Spotify");
    spotifyPlayerRef.current?.play();
  };

  const handleSpotifySeek = (seconds: number) => {
    setPlatform("Spotify");
    youtubePlayerRef.current?.stop();
    spotifyPlayerRef.current?.seek(seconds);
  };

  const handleSpotifyStop = () => {
    spotifyPlayerRef.current?.stop();
  };

  // YoutubePlayer コンポーネントへの ref を作成
  const youtubePlayerRef = useRef<{
    play: () => void;
    stop: () => void;
    changeVideo: (videoId: string, startSeconds: number) => void;
  }>(null);

  const handleYoutubePlay = () => {
    setPlatform("Youtube");
    spotifyPlayerRef.current?.stop();
    youtubePlayerRef.current?.changeVideo("vsH15_DJRMY", 120);
  };

  const handleYoutubeStop = () => {
    youtubePlayerRef.current?.stop();
  };

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
            <HeaderComponent opened={menuOpened} toggle={toggleMenu} />
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
            active={currentPath === "/highlights/popular"}
          />
          <NavLink
            href="/highlights/saved"
            label="保存済み"
            leftSection={<IconBookmark stroke={2} />}
            active={currentPath === "/highlights/saved"}
          />
          <Divider my="sm" />
          <ScrollArea style={{ height: "20%" }}>
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

          <SpotifyPlayer
            ref={spotifyPlayerRef}
            uri="spotify:episode:7makk4oTQel546B0PZlDM5"
          />

          <YoutubePlayer
            ref={youtubePlayerRef}
            initialVideoId=""
            initialStartSeconds={0}
          />

          <Paper
            w={"full"}
            h={"10%"}
            shadow="xl"
            bg={"gray.3"}
            p="xl"
            radius={"md"}
            style={{
              display: platform === null ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconPlayerPlayFilled stroke={2} />
          </Paper>

          <Button onClick={handleYoutubePlay}>再生</Button>
          <Button onClick={handleYoutubeStop}>ストップ</Button>
          <Button onClick={handleSpotifyPlay}>Spotify再生</Button>
          <Button onClick={() => handleSpotifySeek(200)}>
            Spotify指定再生
          </Button>
          <Button onClick={handleSpotifyStop}>Spotifyストップ</Button>

          <Button
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                toggleMenu();
                console.log("開いている");
                openModal();
              } else {
                navigate("/create");
              }
            }}
            w="100%"
            bg={"blue.4"}
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
                toggleMenu();
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
