import { Flex, Select, Title, rem } from "@mantine/core";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/authenticator";
import { ShareButton } from "~/features/Highlight/components/ShareButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});

  return json({ userId });
};

export default function Highlights() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const handleChange = (value: string|null) => {
    if (value === null) return;
    switch (value) {
      case "人気順":
        navigate("/highlights/popular");
        break;
      case "新しい順":
        navigate("/highlights/new");
        break;
      case "保存済み":
        navigate("/highlights/saved");
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
          defaultValue={"人気順"}
          data={["人気順", "新しい順", "保存済み"]}
          clearable={false}
          allowDeselect={false}
          onChange={handleChange}
        />
      </Flex>
      <Outlet/>
      <ShareButton userId={data.userId} />
    </div>
  );
}
