import { AppLoadContext } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/drizzle/schema.server";

export const getUserIdByEmail = async (
  email: string,
  context: AppLoadContext
): Promise<string|null> => {
  console.log("これがcontext",context)

  const db = drizzle(context.cloudflare.env.DB);
  console.log("ここはとおりますか？？？？")
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
    .then((rows) => rows[0]);
  if (!user) {
    return null;
  }

  return user.id;
};
