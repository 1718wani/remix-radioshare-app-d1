import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const radioshows = sqliteTable("radioshows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  createdBy: text("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const highlights = sqliteTable("highlights", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  title: text("title").notNull(),
  description: text("description").default(""),
  replayUrl: text("replay_url").notNull(),
  replayStartTime: text("replay_start_time").notNull(),
  replayEndTime: text("replay_end_time").notNull(),
  totalReplayTimes: integer("total_replay_times").default(0),
  createdBy: text("user_id")
    .references(() => users.id)
    .notNull(),
  radioshowId: text("radioshow_id")
    .references(() => radioshows.id)
    .notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userHighlights = sqliteTable(
  "userHighlights",
  {
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    highlightId: text("highlight_id")
      .references(() => highlights.id)
      .notNull(),
    replayed: integer("played", { mode: "boolean" }).default(false),
    saved: integer("saved", { mode: "boolean" }).default(false),
    liked: integer("liked", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.highlightId] }),
    };
  }
);
