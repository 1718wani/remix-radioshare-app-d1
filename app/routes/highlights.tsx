import { Flex, Select, Title, rem } from "@mantine/core";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/authenticator";
import { RadioShowHeader } from "~/features/Highlight/components/RadioShowHeader";
import { ShareButton } from "~/features/Highlight/components/ShareButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});

  return json({ userId });
};

export default function Highlights() {
  const data = useLoaderData<typeof loader>();


  return (
    <div>
    
      <Outlet />
      <ShareButton userId={data.userId} />
    </div>
  );
}



// const navigate = useNavigate();
// const matches = useMatches();
// const currentPath = matches[matches.length - 1]?.pathname ?? "";

// const handleChange = (value: string | null) => {
//   if (value === null) return;
//   switch (value) {
//     case "人気順":
//       navigate("/");
//       break;
//     case "新しい順":
//       navigate("/highlights/new");
//       break;
//     default:
//       break;
//   }
// };