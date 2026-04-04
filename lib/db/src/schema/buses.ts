import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const busesTable = pgTable("buses", {
  id: serial("id").primaryKey(),
  operator: text("operator").notNull(),
  busNumber: text("bus_number").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  busType: text("bus_type").notNull().default("seater"),
  seatsAvailable: integer("seats_available").notNull().default(40),
  amenities: text("amenities").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBusSchema = createInsertSchema(busesTable).omit({ id: true, createdAt: true });
export type InsertBus = z.infer<typeof insertBusSchema>;
export type Bus = typeof busesTable.$inferSelect;
