import { Router } from "express";
import crypto from "crypto";

const router = Router();

// Razorpay configuration (use environment variables in production)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_xxxxx";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "your_secret_key";

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for payment
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, bookingId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // In a real implementation, you would use Razorpay SDK:
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: RAZORPAY_KEY_ID,
    //   key_secret: RAZORPAY_KEY_SECRET,
    // });
    // const order = await razorpay.orders.create({
    //   amount: amount * 100, // amount in paise
    //   currency,
    //   receipt: receipt || `receipt_${Date.now()}`,
    //   notes: { bookingId },
    // });

    // Mock order response for development
    const mockOrder = {
      id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      entity: "order",
      amount: amount * 100,
      amount_paid: 0,
      amount_due: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      status: "created",
      attempts: 0,
      notes: { bookingId },
      created_at: Math.floor(Date.now() / 1000),
    };

    res.json({
      success: true,
      order: mockOrder,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isValid = expectedSign === razorpay_signature;

    if (isValid) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: error.message || "Verification failed" });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Razorpay webhooks
 */
router.post("/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(webhookBody)
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        console.log("Payment authorized:", payload.payment.entity.id);
        // Update booking status to 'paid'
        break;

      case "payment.captured":
        console.log("Payment captured:", payload.payment.entity.id);
        // Update booking status to 'paid'
        break;

      case "payment.failed":
        console.log("Payment failed:", payload.payment.entity.id);
        // Update booking status to 'failed'
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message || "Webhook processing failed" });
  }
});

export default router;
