import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userActivityTable = pgTable("user_activity", {
  id:               serial("id").primaryKey(),
  userId:           text("user_id").notNull().unique(),
  name:             text("name"),
  phone:            text("phone"),
  lastSearchType:   text("last_search_type"),
  lastSearchFrom:   text("last_search_from"),
  lastSearchTo:     text("last_search_to"),
  lastSearchAt:     timestamp("last_search_at", { withTimezone: true }),
  lastBookingId:    text("last_booking_id"),
  lastBookingType:  text("last_booking_type"),
  lastBookingAt:    timestamp("last_booking_at", { withTimezone: true }),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketingMessagesTable = pgTable("marketing_messages", {
  id:           serial("id").primaryKey(),
  userId:       text("user_id"),
  phone:        text("phone").notNull(),
  messageType:  text("message_type").notNull(),
  status:       text("status").notNull().default("pending"),
  body:         text("body"),
  scheduledAt:  timestamp("scheduled_at", { withTimezone: true }),
  sentAt:       timestamp("sent_at", { withTimezone: true }),
  error:        text("error"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
