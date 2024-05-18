import { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import { users } from "~/drizzle/schema.server";
import { GoogleProfile } from "remix-auth-google";
import { AuthorizationError } from "remix-auth";

export const createUserWithoutPassoword = async (
  profile: GoogleProfile,
  context: AppLoadContext
) => {
  console.log("ユーザー作成処理を通過しました",profile);
  try {
    const db = drizzle(context.cloudflare.env.DB);
    const result = await db
      .insert(users)
      .values({ email: profile.emails[0].value, name: profile.displayName })
      .returning()
      .execute();
    return result[0];
  } catch (error) {
    console.error(error);

    throw new AuthorizationError();
  }
};
