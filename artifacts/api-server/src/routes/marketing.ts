import { Router }    from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  scheduleSearchFollowUp,
  cancelSearchFollowUp,
  scheduleBookingFollowUp,
  upsertUserActivity,
  triggerDailyOffersNow,
  getMarketingStats,
} from "../lib/marketing-scheduler.js";

const router = Router();

/**
 * POST /api/marketing/search-event
 * Called by the frontend when a user searches for flights/hotels/buses.
 * Saves activity + schedules 10-min WhatsApp trigger.
 */
router.post("/marketing/search-event", async (req, res) => {
  const {
    userId, name, phone,
    searchType, from, to,
  } = req.body;

  if (!userId || !searchType) {
    return res.status(400).json({ error: "userId and searchType are required" });
  }

  if (!phone) {
    // Save activity silently, but skip WhatsApp (no phone)
    await upsertUserActivity({ userId, name, phone, searchType, searchFrom: from, searchTo: to }).catch(() => {});
    return res.json({ ok: true, scheduled: false, reason: "No phone number" });
  }

  scheduleSearchFollowUp({ userId, name: name || "Traveller", phone, searchType, from, to });

  res.json({ ok: true, scheduled: true });
});

/**
 * POST /api/marketing/cancel-search
 * Cancel search follow-up for a user who has completed a booking.
 */
router.post("/marketing/cancel-search", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  cancelSearchFollowUp(userId);
  res.json({ ok: true });
});

/**
 * POST /api/marketing/booking-followup
 * Schedule 6-hour booking follow-up after a successful booking.
 */
router.post("/marketing/booking-followup", async (req, res) => {
  const {
    userId, name, phone,
    bookingId, bookingType, from, to,
  } = req.body;

  if (!userId || !bookingId) {
    return res.status(400).json({ error: "userId and bookingId are required" });
  }

  if (!phone) {
    await upsertUserActivity({ userId, name, phone, bookingId, bookingType }).catch(() => {});
    return res.json({ ok: true, scheduled: false, reason: "No phone number" });
  }

  scheduleBookingFollowUp({
    userId,
    name:        name   || "Traveller",
    phone,
    bookingId,
    bookingType: bookingType || "flight",
    from,
    to,
  });

  res.json({ ok: true, scheduled: true });
});

/**
 * POST /api/marketing/activity
 * Generic activity save (no scheduling).
 */
router.post("/marketing/activity", async (req, res) => {
  const { userId, name, phone, searchType, searchFrom, searchTo, bookingId, bookingType } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  await upsertUserActivity({ userId, name, phone, searchType, searchFrom, searchTo, bookingId, bookingType });
  res.json({ ok: true });
});

/**
 * POST /api/marketing/send-daily-offers
 * Admin: manually trigger daily offers now.
 */
router.post("/marketing/send-daily-offers", requireAuth, async (req: any, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  const result = await triggerDailyOffersNow();
  res.json({ ok: true, ...result });
});

/**
 * GET /api/marketing/status
 * Admin: get marketing stats.
 */
router.get("/marketing/status", requireAuth, async (req: any, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  const stats = await getMarketingStats();
  res.json(stats);
});

export default router;
