import { Center, Image, Stack, Text, Title } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
}

export default function Success() {
  return (
    <>
      <Center my={"xl"}>
        <Stack>
          <Center>
            <Title order={2}>投稿ありがとうございます！</Title>
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
            width="40"
            height="auto"
            fit="cover"
            src="/greenlisteninggirl.png"
            alt="success"
          />
        </Stack>
      </Center>
    </>
  );
}
