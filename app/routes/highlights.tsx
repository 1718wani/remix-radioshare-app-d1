import { Flex, Select, Title, rem } from "@mantine/core";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/authenticator";
import { ShareButton } from "~/features/Highlight/components/ShareButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});

  return json({ userId });
};

export default function Highlights() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";

  const handleChange = (value: string | null) => {
    if (value === null) return;
    switch (value) {
      case "人気順":
        navigate("/");
        break;
      case "新しい順":
        navigate("/highlights/new");
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Flex justify={"space-between"} m={"md"}>
        <Title order={2}>ハイライト一覧</Title>
        <Select
          withCheckIcon={false}
          w={rem(120)}
          defaultValue={currentPath === "/highlights/new" ? "新しい順" : "人気順"}
          data={["人気順", "新しい順"]}
          clearable={false}
          allowDeselect={false}
          onChange={handleChange}
        />
      </Flex>
      <Outlet />
      <ShareButton userId={data.userId} />
    </div>
  );
}
