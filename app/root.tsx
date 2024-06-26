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
  json,
  useLoaderData,
  useMatches,
  Form,
  useRouteError,
  Link,
  useRouteLoaderData,
  useNavigate,
  useNavigation,
  NavLink as RemixNavLink,
} from "@remix-run/react";
import {
  ColorSchemeScript,
  MantineProvider,
  AppShell,
  ScrollArea,
  Divider,
  Button,
  Center,
  Stack,
  Title,
  Text,
  Image,
  NavLink as MantineNavLink,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
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
import { HighlightsSkeleton } from "./features/Navigation/components/HighlightsSkeleton";
import { HeaderComponent } from "./components/HeaderComponent";

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
            alt="エラーを表す女の子のイラスト"
          />
        </Stack>
      </Center>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>RadiShare</title>
        <script
          defer
          src="https://umami-olive.vercel.app/script.js"
          data-website-id="80fdd0d2-ba41-46b9-a91d-4e5180dd27d3"
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
  const [menuOpened, setMenuOpened] = useAtom(isSideMenuOpenAtom);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 48em)");
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";

  useToastNotifications(toastMessage);
  const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
    "routes/highlights.$display"
  );

  return (
    <>
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
          <MantineNavLink
            component={RemixNavLink}
            to="/highlights/all"
            label="一覧"
            aria-current={
              currentPath === "/highlights/all" ? "page" : undefined
            }
            leftSection={<IconRadio stroke={2} />}
          />

          <MantineNavLink
            component={RemixNavLink}
            to="/highlights/saved"
            label="保存済み"
            aria-current={
              currentPath === "/highlights/saved" ? "page" : undefined
            }
            leftSection={<IconBookmark stroke={2} />}
          />
          <Divider my="sm" />
          <ScrollArea style={{ height: "72%" }}>
            {radioShows.map((show) => (
              <MantineNavLink
                component={RemixNavLink}
                key={show.id}
                to={`/highlights/${show.id}`}
                label={show.title}
                aria-current={
                  currentPath === `/highlights/${show.id}` ? "page" : undefined
                }
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
            aria-label="新規番組登録"
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
                aria-label="ログアウト"
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
                aria-label="Googleアカウントでログイン、もしくは登録"
              >
                Googleアカウントで ログイン or 登録
              </GoogleButton>
            </Form>
          )}
        </AppShell.Navbar>

        <AppShell.Main>
          {isNavigating ? <HighlightsSkeleton /> : <Outlet />}
        </AppShell.Main>
      </AppShell>
      <LoginNavigateModal opened={modalOpened} close={closeModal} />
    </>
  );
}
