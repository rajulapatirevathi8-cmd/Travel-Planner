import { Router } from "express";
import { sendHolidayWhatsApp, type HolidayWhatsAppData } from "../lib/whatsapp-service.js";

const router = Router();

/**
 * POST /api/holiday-whatsapp
 * Sends a WhatsApp message with itinerary PDF link after:
 *   - holiday lead submission, OR
 *   - holiday package booking confirmed
 */
router.post("/", async (req, res) => {
  try {
    const data: HolidayWhatsAppData = req.body;

    if (!data.phone || !data.destination) {
      return res.status(400).json({ error: "Missing required fields: phone, destination" });
    }

    const result = await sendHolidayWhatsApp(data);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[holiday-whatsapp] Error:", err);
    res.status(500).json({ error: err.message || "Failed to send WhatsApp" });
  }
});

export default router;
