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

router.get("/bookings", async (_req, res): Promise<void> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(bookingsTable.createdAt);

  const mapped = bookings.map((b) => ({
    ...b,
    totalPrice: Number(b.totalPrice),
    createdAt: b.createdAt.toISOString(),
  }));
  res.json(ListBookingsResponse.parse(mapped));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { bookingType, referenceId, passengerName, passengerEmail, passengerPhone, passengers, travelDate, details } = parsed.data;

  let totalPrice = 0;

  if (bookingType === "flight") {
    const { flightsTable } = await import("@workspace/db");
    const [flight] = await db.select().from(flightsTable).where(eq(flightsTable.id, referenceId));
    if (!flight) {
      res.status(404).json({ error: "Flight not found" });
      return;
    }
    totalPrice = Number(flight.price) * passengers;
  } else if (bookingType === "bus") {
    const { busesTable } = await import("@workspace/db");
    const [bus] = await db.select().from(busesTable).where(eq(busesTable.id, referenceId));
    if (!bus) {
      res.status(404).json({ error: "Bus not found" });
      return;
    }
    totalPrice = Number(bus.price) * passengers;
  } else if (bookingType === "hotel") {
    const { hotelsTable } = await import("@workspace/db");
    const [hotel] = await db.select().from(hotelsTable).where(eq(hotelsTable.id, referenceId));
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }
    totalPrice = Number(hotel.pricePerNight) * passengers;
  } else if (bookingType === "package") {
    const { packagesTable } = await import("@workspace/db");
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, referenceId));
    if (!pkg) {
      res.status(404).json({ error: "Package not found" });
      return;
    }
    totalPrice = Number(pkg.price) * passengers;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      bookingType,
      referenceId,
      status: "confirmed",
      passengerName,
      passengerEmail,
      passengerPhone: passengerPhone ?? null,
      totalPrice: String(totalPrice),
      passengers,
      travelDate,
      details: details ?? null,
    })
    .returning();

  res.status(201).json(
    GetBookingResponse.parse({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      createdAt: booking.createdAt.toISOString(),
    })
  );
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
    })
  );
});

export default router;
