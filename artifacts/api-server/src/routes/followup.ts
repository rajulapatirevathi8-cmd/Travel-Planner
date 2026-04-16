import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, leadFollowupsTable } from "@workspace/db";
import {
  scheduleFollowUps,
  cancelFollowUps,
  getFollowUpSettings,
  updateFollowUpSettings,
  type LeadData,
} from "../lib/followup-scheduler.js";

const router = Router();

/**
 * POST /api/followup/schedule
 * Start the 3-step follow-up sequence for a new lead.
 * Body: { leadId, name, phone, destination, duration?, people?, travelDate? }
 */
router.post("/schedule", async (req, res) => {
  try {
    const lead: LeadData = req.body;

    if (!lead.leadId || !lead.phone || !lead.destination || !lead.name) {
      return res.status(400).json({ error: "Missing required fields: leadId, name, phone, destination" });
    }

    await scheduleFollowUps(lead);
    res.json({ success: true, message: "Follow-up sequence scheduled" });
  } catch (err: any) {
    console.error("[followup] /schedule error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/followup/cancel
 * Cancel all pending follow-ups for a lead.
 * Body: { leadId }
 */
router.post("/cancel", async (req, res) => {
  try {
    const { leadId } = req.body;
    if (!leadId) return res.status(400).json({ error: "Missing leadId" });

    await cancelFollowUps(leadId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[followup] /cancel error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/followup/log?leadId=LD-xxx
 * Get the follow-up history for a specific lead.
 */
router.get("/log", async (req, res) => {
  try {
    const { leadId } = req.query as { leadId?: string };

    const rows = leadId
      ? await db.select().from(leadFollowupsTable).where(eq(leadFollowupsTable.leadId, leadId))
      : await db.select().from(leadFollowupsTable).orderBy(leadFollowupsTable.scheduledAt);

    res.json(rows);
  } catch (err: any) {
    console.error("[followup] /log error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/followup/settings
 * Get current follow-up automation settings.
 */
router.get("/settings", async (_req, res) => {
  try {
    const settings = await getFollowUpSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/followup/settings
 * Update follow-up automation settings.
 * Body: { enabled?, msg10min?, msg2hr?, msg24hr? }
 */
router.put("/settings", async (req, res) => {
  try {
    const updates = req.body;
    const updated = await updateFollowUpSettings(updates);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
