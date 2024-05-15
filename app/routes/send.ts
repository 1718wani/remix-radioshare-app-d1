
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Resend } from "resend";


export const loader = async ({ context }: ActionFunctionArgs) => {
  const resend = new Resend(context.cloudflare.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: "Acme <support@resend.dev>",
    to: ["ikuya1293@gmail.com"],
    subject: "Hello world",
    html: "<strong>It works!</strong>",
  });

  if (error) {
    return json({ error }, 400);
  }

  return json(data, 200);
};
