import { AuthorizationError } from "remix-auth";
import bcrypt from "bcryptjs";
import { AppLoadContext } from "@remix-run/cloudflare";
import { users } from "~/drizzle/schema.server";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";


export async function signIn(
  email: string,
  password: string,
  context: AppLoadContext
) {
  
  const db = drizzle(context.cloudflare.env.DB);
  console.log("db",db)
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
    .then((rows) => rows[0]);

  if (!user) {
    console.log("you entered a wrong email");
    throw new AuthorizationError();
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string
  );

  console.log(passwordsMatch,"passwordmatch")

  if (!passwordsMatch) {
    throw new AuthorizationError();
  }

  return user.id;
}
