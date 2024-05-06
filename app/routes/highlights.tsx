import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import {
  Outlet,
} from "@remix-run/react";
import { authenticator } from "~/features/Auth/services/authenticator";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request, {});

  return json({ userId });
};

export default function Highlights() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
