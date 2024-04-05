import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { z } from "zod";
import { checkUserExists } from "~/features/Auth/apis/checkUserExists";
import { authenticator } from "~/features/Auth/services/authenticator";
import { commitSession, getSession } from "~/features/Auth/sessionStrage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/highlights/popular",
  });

  const session = await getSession(request.headers.get("Cookie"));
  const toastMessage = (session.get("message") as string) || null;
  console.log(toastMessage, "toastmessageがあります");

  return json(
    { toastMessage },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export async function action({ request, context }: ActionFunctionArgs) {
  const clonedData = request.clone();
  const formData = await clonedData.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({
      success: false,
      message: "データの送信に失敗しました",
      submission: submission.reply(),
    });
  }

  const isEmailExisting = await checkUserExists(
    submission.value.email,
    context
  );

  if (!isEmailExisting) {
    return json({
      success: false,
      message: "このメールアドレスは存在しません",
      submission: submission.reply(),
    });
  }

  try {
    const userId = await authenticator.authenticate("user-signin", request, {
      failureRedirect: "/signin",
      context: context,
    });

    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, userId);
    // commit the session
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect("/success", { headers });
  } catch (error) {
    return json({
      success: false,
      message: "パスワードが異なっています",
      submission: submission.reply(),
    });
  }
}

const schema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email is invalid"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(
      /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
      "パスワードは半角英数字混合で入力してください"
    ),
});

export default function Signin() {
  const data = useActionData<typeof action>();
  const toastMessage = useLoaderData<typeof loader>().toastMessage;
  console.log(toastMessage, "クライアントサイドでのtoastmessage");

  const [form, { email, password }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  

  useEffect(() => {
    if (toastMessage) {
      console.log(toastMessage, "toastmessageが呼び出されるはずの場所");
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "新規ユーザー登録が完了しました",
        message: "再度ログインしてください",
        color: "green",
        icon: <IconCheck />,
      });
    }

    if (!data) return;
    if (!data.success) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "ログインに失敗しました",
        message: data.message,
        color: "red",
        icon: <IconX />,
      });
    }

    

    console.log(data);
    // {
    //   message: <server message>,
    //   submission: typeof SubmissionResult,
    //   success: <boolean>,
    // }

    if (data.success) {
      alert(data.message);
    }
  }, [data, toastMessage]);

  return (
    <>
      <Form method="post" {...getFormProps(form)}>
        <Stack gap="md" mx={"xl"} mt={"lg"}>
          <Title order={2}>ログイン</Title>
          <TextInput
            {...getInputProps(email, { type: "email" })}
            name="email"
            placeholder="メールアドレス"
            label="Email"
            error={email.errors}
          />

          <PasswordInput
            {...getInputProps(password, { type: "password" })}
            name="password"
            placeholder="パスワード"
            label="Password"
            error={password.errors}
          />

          <Link
            to="/signup"
            style={{ textDecoration: "none", width: "fit-content" }}
          >
            <Text
              size="sm"
              variant="gradient"
              fw={700}
              gradient={{ from: "blue", to: "blue.3" }}
            >
              新規登録の方はこちら
            </Text>
          </Link>
          <Button fullWidth type="submit">
            ログイン
          </Button>
        </Stack>
      </Form>
    </>
  );
}
