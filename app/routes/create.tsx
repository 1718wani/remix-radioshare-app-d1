import { Title } from "@mantine/core";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { createRadioshow } from "~/features/Radioshow/apis/createRadioshow";
import { RadioshowCreateForm } from "~/features/Radioshow/components/RadioshowCreateForm";
import { authenticator } from "~/features/Auth/services/authenticator";
import { getSession } from "~/features/Auth/sessionStrage";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const session = await getSession(request.headers.get("cookie"));
  console.log("sessionの値", session.data.user);
  await createRadioshow({ title, imageUrl }, context, request);
  return redirect("/");
};

export default function RadioshowCreate() {
  return (
    <>
      <Title m={"md"} order={2}>
        新しいラジオ番組登録
      </Title>
      <RadioshowCreateForm />
    </>
  );
}
