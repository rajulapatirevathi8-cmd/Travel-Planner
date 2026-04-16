/**
 * Holiday Lead Follow-Up Scheduler
 *
 * Schedules 3 WhatsApp follow-up messages per lead:
 *   Step 1 — 10 minutes after lead creation
 *   Step 2 — 2 hours after lead creation
 *   Step 3 — 24 hours after lead creation
 *
 * Follow-ups are persisted to the `lead_followups` DB table so they can be
 * recovered on server restart (re-scheduled if still in the future).
 *
 * Safety rules:
 *   - Max 3 messages per lead
 *   - Stops automatically when lead status = "booked" or "contacted"
 *   - Can be cancelled programmatically (e.g. when admin marks as contacted)
 *   - Global enable/disable toggle via followup_settings table
 */

import { eq, and } from "drizzle-orm";
import { db, leadFollowupsTable, followupSettingsTable } from "@workspace/db";
import { sendHolidayWhatsApp } from "./whatsapp-service.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LeadData {
  leadId:      string;
  name:        string;
  phone:       string;
  destination: string;
  duration?:   string;
  people?:     number;
  travelDate?: string;
}

export interface FollowUpSettings {
  enabled:  boolean;
  msg10min: string;
  msg2hr:   string;
  msg24hr:  string;
}

// ── Default messages ──────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: FollowUpSettings = {
  enabled:  true,
  msg10min: "Hi {name}, just checking 😊\nDid you see your {destination} itinerary? Our travel expert is ready to help you plan the perfect trip!",
  msg2hr:   "We have limited slots for your {destination} trip 🌴\nLet us know if you want to customize your plan. Our expert can create a tailored package just for you!",
  msg24hr:  "Special offer 🎉\nGet ₹500 OFF if you confirm your {destination} booking today!\nOffer valid for the next 24 hours only. Call us now to avail!",
};

// In-memory settings cache (refreshed from DB periodically or on first read)
let cachedSettings: FollowUpSettings | null = null;

// In-memory timer handles — key: `${leadId}:${step}`
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// Steps config
const STEPS: Array<{ key: "10min" | "2hr" | "24hr"; delayMs: number; msgKey: keyof Omit<FollowUpSettings, "enabled"> }> = [
  { key: "10min", delayMs: 10 * 60 * 1000,       msgKey: "msg10min" },
  { key: "2hr",   delayMs: 2 * 60 * 60 * 1000,   msgKey: "msg2hr"   },
  { key: "24hr",  delayMs: 24 * 60 * 60 * 1000,  msgKey: "msg24hr"  },
];

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getFollowUpSettings(): Promise<FollowUpSettings> {
  if (cachedSettings) return cachedSettings;
  try {
    const rows = await db.select().from(followupSettingsTable).limit(1);
    if (rows.length > 0) {
      cachedSettings = {
        enabled:  rows[0].enabled,
        msg10min: rows[0].msg10min,
        msg2hr:   rows[0].msg2hr,
        msg24hr:  rows[0].msg24hr,
      };
      return cachedSettings;
    }
    // Seed default row
    await db.insert(followupSettingsTable).values({});
    cachedSettings = { ...DEFAULT_SETTINGS };
    return cachedSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateFollowUpSettings(
  updates: Partial<FollowUpSettings>
): Promise<FollowUpSettings> {
  const current = await getFollowUpSettings();
  const next    = { ...current, ...updates };

  try {
    const rows = await db.select().from(followupSettingsTable).limit(1);
    if (rows.length > 0) {
      await db
        .update(followupSettingsTable)
        .set({ enabled: next.enabled, msg10min: next.msg10min, msg2hr: next.msg2hr, msg24hr: next.msg24hr, updatedAt: new Date() })
        .where(eq(followupSettingsTable.id, rows[0].id));
    } else {
      await db.insert(followupSettingsTable).values(next);
    }
  } catch (err) {
    console.error("[followup] Failed to persist settings:", err);
  }

  cachedSettings = next;
  return next;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMessage(template: string, lead: LeadData): string {
  return template
    .replace(/\{name\}/g,        lead.name)
    .replace(/\{destination\}/g, lead.destination);
}

// ── Core scheduler ────────────────────────────────────────────────────────────

/**
 * Schedule the 3 follow-up messages for a newly created lead.
 * Records each step as a `pending` row in lead_followups.
 */
export async function scheduleFollowUps(lead: LeadData): Promise<void> {
  const settings = await getFollowUpSettings();
  if (!settings.enabled) {
    console.info(`[followup] Auto follow-up disabled — skipping lead ${lead.leadId}`);
    return;
  }

  const now = Date.now();

  for (const step of STEPS) {
    const message     = formatMessage(settings[step.msgKey], lead);
    const scheduledAt = new Date(now + step.delayMs);

    // Persist to DB
    let rowId: number | undefined;
    try {
      const inserted = await db
        .insert(leadFollowupsTable)
        .values({
          leadId:      lead.leadId,
          leadName:    lead.name,
          phone:       lead.phone,
          destination: lead.destination,
          step:        step.key,
          message,
          status:      "pending",
          scheduledAt,
        })
        .returning({ id: leadFollowupsTable.id });
      rowId = inserted[0]?.id;
    } catch (err) {
      console.error(`[followup] DB insert failed for step ${step.key}:`, err);
    }

    // Set timeout
    const timerKey = `${lead.leadId}:${step.key}`;
    const handle   = setTimeout(
      () => executeFollowUp(lead, step.key, rowId),
      step.delayMs,
    );
    timers.set(timerKey, handle);

    console.info(`[followup] Scheduled ${step.key} for lead ${lead.leadId} at ${scheduledAt.toISOString()}`);
  }
}

/**
 * Cancel all pending follow-ups for a lead (e.g. when marked as contacted/booked).
 */
export async function cancelFollowUps(leadId: string): Promise<void> {
  for (const step of STEPS) {
    const timerKey = `${leadId}:${step.key}`;
    const handle   = timers.get(timerKey);
    if (handle) {
      clearTimeout(handle);
      timers.delete(timerKey);
    }
  }

  // Mark pending DB rows as cancelled
  try {
    await db
      .update(leadFollowupsTable)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(leadFollowupsTable.leadId, leadId),
          eq(leadFollowupsTable.status, "pending"),
        )
      );
    console.info(`[followup] Cancelled all pending follow-ups for lead ${leadId}`);
  } catch (err) {
    console.error(`[followup] Failed to cancel DB rows for ${leadId}:`, err);
  }
}

/**
 * Execute a single follow-up step — sends WhatsApp and updates DB row.
 */
async function executeFollowUp(
  lead:  LeadData,
  step:  "10min" | "2hr" | "24hr",
  rowId: number | undefined,
): Promise<void> {
  const timerKey = `${lead.leadId}:${step}`;
  timers.delete(timerKey);

  const settings = await getFollowUpSettings();
  if (!settings.enabled) {
    console.info(`[followup] Skipping ${step} for ${lead.leadId} — follow-up disabled`);
    if (rowId) {
      await db.update(leadFollowupsTable).set({ status: "cancelled" }).where(eq(leadFollowupsTable.id, rowId)).catch(() => {});
    }
    return;
  }

  const stepConfig = STEPS.find((s) => s.key === step)!;
  const message    = formatMessage(settings[stepConfig.msgKey], lead);

  console.info(`[followup] Sending ${step} message to ${lead.phone} for lead ${lead.leadId}`);

  const result = await sendHolidayWhatsApp({
    customerName: lead.name,
    phone:        lead.phone,
    destination:  lead.destination,
    duration:     lead.duration,
    people:       lead.people,
    travelDate:   lead.travelDate,
    trigger:      "lead",
  });

  const now = new Date();

  if (rowId) {
    try {
      await db.update(leadFollowupsTable)
        .set({
          status:  result.sent ? "sent" : "failed",
          message,
          sentAt:  now,
          error:   result.sent ? null : (result.reason ?? "Unknown error"),
        })
        .where(eq(leadFollowupsTable.id, rowId));
    } catch (err) {
      console.error(`[followup] DB update failed for row ${rowId}:`, err);
    }
  }

  console.info(`[followup] ${step} for ${lead.leadId}: ${result.sent ? "sent ✓" : `failed — ${result.reason}`}`);
}

// ── Recovery on server restart ────────────────────────────────────────────────

/**
 * On startup, re-schedule any `pending` follow-ups that haven't fired yet.
 * Called from the main server startup.
 */
export async function recoverPendingFollowUps(): Promise<void> {
  try {
    const pending = await db
      .select()
      .from(leadFollowupsTable)
      .where(eq(leadFollowupsTable.status, "pending"));

    if (pending.length === 0) return;

    const now = Date.now();
    let recovered = 0;

    for (const row of pending) {
      const fireAt = new Date(row.scheduledAt).getTime();
      const delay  = Math.max(0, fireAt - now);

      const lead: LeadData = {
        leadId:      row.leadId,
        name:        row.leadName,
        phone:       row.phone,
        destination: row.destination,
      };
      const step = row.step as "10min" | "2hr" | "24hr";

      const timerKey = `${row.leadId}:${step}`;
      if (!timers.has(timerKey)) {
        const handle = setTimeout(
          () => executeFollowUp(lead, step, row.id),
          delay,
        );
        timers.set(timerKey, handle);
        recovered++;
      }
    }

    if (recovered > 0) {
      console.info(`[followup] Recovered ${recovered} pending follow-up(s) from DB`);
    }
  } catch (err) {
    console.error("[followup] Recovery error:", err);
  }
}
