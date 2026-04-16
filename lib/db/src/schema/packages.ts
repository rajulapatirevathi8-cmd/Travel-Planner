import { pgTable, text, serial, integer, numeric, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  duration: integer("duration").notNull(),
  nights: integer("nights").notNull().default(0),
  type: text("type").notNull().default("beach"),

  // ── Price triple: AI price, admin override, computed final ─────────────────
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),          // base/legacy price
  aiPrice: numeric("ai_price", { precision: 10, scale: 2 }),               // price set by AI generator
  adminPrice: numeric("admin_price", { precision: 10, scale: 2 }),         // admin override (if set, takes priority)
  // finalPrice = adminPrice ?? aiPrice ?? price  (computed in API, not stored)

  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  images: text("images").array().notNull().default([]),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.0"),
  reviewCount: integer("review_count").notNull().default(0),
  includes: text("includes").array().notNull().default([]),
  exclusions: text("exclusions").array().notNull().default([]),
  highlights: text("highlights").array().notNull().default([]),
  description: text("description"),
  itinerary: jsonb("itinerary"),
  packageType: text("package_type"),                                          // audience: honeymoon | family | friends | budget | luxury
  category: text("category"),                                                 // destination category: domestic | international | devotional
  markupPct: numeric("markup_pct", { precision: 5, scale: 2 }),               // admin-overridden markup %; null = use type-based default
  featured: boolean("featured").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),               // admin can disable
  createdBy: text("created_by").notNull().default("admin"),               // "admin" | "ai"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true, createdAt: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;
