import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const enquiriesTable = pgTable("enquiries", {
  id:          serial("id").primaryKey(),
  enquiryId:   text("enquiry_id").notNull().unique(),
  packageId:   integer("package_id").notNull(),
  packageName: text("package_name").notNull(),
  destination: text("destination").notNull(),
  name:        text("name").notNull(),
  phone:       text("phone").notNull(),
  email:       text("email"),
  userId:      text("user_id"),
  source:      text("source").notNull().default("guest"),
  agentId:     text("agent_id"),
  agentName:   text("agent_name"),
  travelDate:  text("travel_date"),
  people:      integer("people").default(2),
  notes:       text("notes"),
  status:      text("status").notNull().default("new"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
