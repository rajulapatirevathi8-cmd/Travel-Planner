import { Router, type IRouter } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, bookingsTable } from "@workspace/db";
import {
  ListBookingsResponse,
  CreateBookingBody,
  GetBookingParams,
  GetBookingResponse,
  CancelBookingParams,
  CancelBookingResponse,
  GetStatsSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// In-memory storage for development (fallback if DB is not available)
let inMemoryBookings: any[] = [];

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const allBookings = await db.select().from(bookingsTable);

  const flightBookings = allBookings.filter((b) => b.bookingType === "flight").length;
  const busBookings = allBookings.filter((b) => b.bookingType === "bus").length;
  const hotelBookings = allBookings.filter((b) => b.bookingType === "hotel").length;
  const packageBookings = allBookings.filter((b) => b.bookingType === "package").length;
  const totalRevenue = allBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

  res.json(
    GetStatsSummaryResponse.parse({
      totalBookings: allBookings.length,
      flightBookings,
      busBookings,
      hotelBookings,
      packageBookings,
      totalRevenue,
    })
  );
});

router.get("/api/bookings", async (req, res): Promise<void> => {
  try {
    // Try to use database first
    const bookings = await db
      .select()
      .from(bookingsTable)
      .orderBy(bookingsTable.createdAt);

    const mapped = bookings.map((b) => ({
      ...b,
      totalPrice: Number(b.totalPrice),
      createdAt: b.createdAt.toISOString(),
      passengerPhone: b.passengerPhone ?? undefined,
      details: b.details ?? undefined,
    }));
    res.json(ListBookingsResponse.parse(mapped));
  } catch (error) {
    // Fallback to in-memory storage if DB fails
    console.log("Using in-memory storage for bookings");
    res.json(inMemoryBookings);
  }
});

router.post("/api/bookings", async (req, res): Promise<void> => {
  try {
    const bookingData = req.body;
    
    // Generate ID if not provided
    if (!bookingData.id) {
      bookingData.id = `BK${Date.now()}`;
    }
    
    // Add created timestamp
    if (!bookingData.bookingDate) {
      bookingData.bookingDate = new Date().toISOString();
    }
    
    // Store in memory (development mode)
    inMemoryBookings.push(bookingData);
    
    console.log("✅ Booking saved to backend:", bookingData);
    console.log("📦 Total backend bookings:", inMemoryBookings.length);
    
    res.status(201).json(bookingData);
  } catch (error) {
    console.error("❌ Error saving booking:", error);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, params.data.id));

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(
    GetBookingResponse.parse({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      createdAt: booking.createdAt.toISOString(),
      passengerPhone: booking.passengerPhone ?? undefined,
      details: booking.details ?? undefined,
    })
  );
});

router.delete("/bookings/:id", async (req, res): Promise<void> => {
  const params = CancelBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, params.data.id));

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  res.json(
    CancelBookingResponse.parse({
      ...updated,
      totalPrice: Number(updated.totalPrice),
      createdAt: updated.createdAt.toISOString(),
      passengerPhone: updated.passengerPhone ?? undefined,
      details: updated.details ?? undefined,
    })
  );
});

export default router;
