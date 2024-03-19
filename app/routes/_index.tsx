import { json, type MetaFunction } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { resources } from "~/drizzle/schema.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const href = formData.get("href") as string;
  const db = drizzle(context.cloudflare.env.DB);
  await db.insert(resources).values({ title, href }).execute();
  return json({ message: "Resource added" }, { status: 201 });
}
export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  const resourceList = await db
    .select({
      id: resources.id,
      title: resources.title,
      href: resources.href,
    })
    .from(resources)
    .orderBy(resources.id);
  return json({
    resourceList,
  });
}
export default function Index() {
  const { resourceList } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Welcome to Remix (with Drizzle, Vite and Cloudflare D1)</h1>
      <ul>
        {resourceList.map((resource) => (
          <li key={resource.id}>
            <a target="_blank" href={resource.href} rel="noreferrer">
              {resource.title}
            </a>
          </li>
        ))}
      </ul>
      <Form method="POST">
        <div>
          <label>
            Title: <input type="text" name="title" required />
          </label>
        </div>
        <div>
          <label>
            URL: <input type="url" name="href" required />
          </label>
        </div>
        <button type="submit">Add Resource</button>
      </Form>
    </div>
  );
}
