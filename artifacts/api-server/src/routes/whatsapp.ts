import { Router } from "express";
import { sendWhatsAppNotification, type WhatsAppBookingData } from "../lib/whatsapp-service.js";

const router = Router();

/**
 * POST /api/send-whatsapp
 * Sends a WhatsApp booking confirmation to the passenger's phone.
 */
router.post("/", async (req, res) => {
  try {
    const data: WhatsAppBookingData = req.body;

    if (!data.bookingId || !data.phone) {
      return res.status(400).json({ error: "Missing required fields: bookingId, phone" });
    }

    const result = await sendWhatsAppNotification(data);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("send-whatsapp error:", err);
    res.status(500).json({ error: err.message || "Failed to send WhatsApp message" });
  }
});

export default router;
