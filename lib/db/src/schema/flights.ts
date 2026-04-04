import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const flightsTable = pgTable("flights", {
  id: serial("id").primaryKey(),
  airline: text("airline").notNull(),
  flightNumber: text("flight_number").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  class: text("class").notNull().default("economy"),
  seatsAvailable: integer("seats_available").notNull().default(50),
  stops: integer("stops").notNull().default(0),
  airlineLogoUrl: text("airline_logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFlightSchema = createInsertSchema(flightsTable).omit({ id: true, createdAt: true });
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flightsTable.$inferSelect;
