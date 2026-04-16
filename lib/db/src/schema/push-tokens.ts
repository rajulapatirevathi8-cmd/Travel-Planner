import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const pushTokensTable = pgTable("push_tokens", {
  id:        serial("id").primaryKey(),
  token:     text("token").notNull().unique(),
  userId:    text("user_id"),
  phone:     text("phone"),
  email:     text("email"),
  name:      text("name"),
  platform:  text("platform").notNull().default("web"),
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pushNotificationsLogTable = pgTable("push_notifications_log", {
  id:        serial("id").primaryKey(),
  token:     text("token").notNull(),
  type:      text("type").notNull(),
  title:     text("title").notNull(),
  body:      text("body").notNull(),
  status:    text("status").notNull().default("sent"),
  error:     text("error"),
  sentAt:    timestamp("sent_at").notNull().defaultNow(),
});
