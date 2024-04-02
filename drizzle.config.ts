import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const cfConfig = {
  schema: "./app/drizzle/schema.server.ts",
  out: "./app/drizzle/migrations",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.toml",
    dbName: "db",
  },
  verbose: false,
  strict: true,
} satisfies Config;

const localConfig = {
  schema: "./app/drizzle/schema.server.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/e83effffceef7dc381c494a5b23e634109721c2af3922b63e5e81433dda07669.sqlite",
  },
} satisfies Config;

export default import.meta.env.VITE_NODE_ENV === "production" ? cfConfig : localConfig;
// export default process.env.NODE_ENV === "production" ? cfConfig : localConfig;
