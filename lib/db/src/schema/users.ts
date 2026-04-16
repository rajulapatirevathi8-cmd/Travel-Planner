import {
  pgTable,
  text,
  serial,
  boolean,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    role: text("role").notNull().default("user"),
    agentCode: text("agent_code"),
    agencyName: text("agency_name"),
    gstNumber: text("gst_number"),
    commission: numeric("commission", { precision: 5, scale: 2 }),
    isApproved: boolean("is_approved").default(false),
    walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 }).default("0"),
    referralCode: text("referral_code"),
    referredBy: text("referred_by"),
    deviceId: text("device_id"),
    otpUser: boolean("otp_user").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("users_email_unique").on(table.email),
    unique("users_phone_unique").on(table.phone),
  ],
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
