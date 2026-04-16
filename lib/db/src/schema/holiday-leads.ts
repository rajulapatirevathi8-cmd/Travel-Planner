import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Lead follow-ups log ───────────────────────────────────────────────────────
// Each row = one scheduled (or sent/cancelled) follow-up message for a lead.
export const leadFollowupsTable = pgTable("lead_followups", {
  id:           serial("id").primaryKey(),
  leadId:       text("lead_id").notNull(),        // e.g. "LD-1234567890"
  leadName:     text("lead_name").notNull(),
  phone:        text("phone").notNull(),
  destination:  text("destination").notNull(),
  step:         text("step").notNull(),            // "10min" | "2hr" | "24hr"
  message:      text("message").notNull(),
  status:       text("status").notNull().default("pending"), // pending|sent|cancelled|failed
  error:        text("error"),
  scheduledAt:  timestamp("scheduled_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt:       timestamp("sent_at", { withTimezone: true }),
});

// ── Follow-up settings (single-row config) ────────────────────────────────────
export const followupSettingsTable = pgTable("followup_settings", {
  id:           serial("id").primaryKey(),
  enabled:      boolean("enabled").notNull().default(true),
  msg10min:     text("msg_10min").notNull().default(
    "Hi {name}, just checking 😊\nDid you see your {destination} itinerary? Our travel expert is ready to help you plan the perfect trip!"
  ),
  msg2hr:       text("msg_2hr").notNull().default(
    "We have limited slots for your {destination} trip 🌴\nLet us know if you want to customize your plan. Our expert can create a tailored package just for you!"
  ),
  msg24hr:      text("msg_24hr").notNull().default(
    "Special offer 🎉\nGet ₹500 OFF if you confirm your {destination} booking today!\nOffer valid for the next 24 hours only. Call us now to avail!"
  ),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── CRM Leads table ───────────────────────────────────────────────────────────
// status values: viewed | guest_lead | abandoned | new | contacted | interested | booked | lost
export const leadsTable = pgTable("leads", {
  id:          serial("id").primaryKey(),
  leadId:      text("lead_id").notNull().unique(),
  name:        text("name").notNull(),
  phone:       text("phone").notNull(),
  email:       text("email"),
  type:        text("type").notNull().default("flight"),  // flight|bus|hotel|holiday
  source:      text("source").notNull().default("form"),  // auto|form|agent
  status:      text("status").notNull().default("new"),
  packageId:   integer("package_id"),                     // holiday package id (for dedup)
  packageName: text("package_name"),                      // holiday package name (for display)
  assignedTo:  text("assigned_to"),
  assignedName: text("assigned_name"),
  bookingRef:  text("booking_ref"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
