import { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/drizzle/schema.server";

export const checkUserExists = async (
  email: string,
  context: AppLoadContext
): Promise<boolean> => {
  const db = drizzle(context.cloudflare.env.DB);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
    .then((rows) => rows[0]);

  const isUserExists = user ? true : false;
  return isUserExists;
};
