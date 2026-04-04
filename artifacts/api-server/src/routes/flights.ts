import { Router, type IRouter } from "express";
import { ilike, or, eq } from "drizzle-orm";
import { db, flightsTable } from "@workspace/db";
import {
  SearchFlightsQueryParams,
  SearchFlightsResponse,
  ListFlightsResponse,
  GetFlightParams,
  GetFlightResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/flights/search", async (req, res): Promise<void> => {
  const parsed = SearchFlightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { origin, destination, class: flightClass, passengers } = parsed.data;

  let query = db
    .select()
    .from(flightsTable)
    .$dynamic();

  const conditions = [];
  if (origin) {
    conditions.push(ilike(flightsTable.origin, `%${origin}%`));
  }
  if (destination) {
    conditions.push(ilike(flightsTable.destination, `%${destination}%`));
  }
  if (flightClass) {
    conditions.push(eq(flightsTable.class, flightClass));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const flights = await query;
  const mapped = flights.map((f) => ({
    ...f,
    price: Number(f.price),
    airlineLogoUrl: f.airlineLogoUrl ?? undefined,
  }));
  res.json(SearchFlightsResponse.parse(mapped));
});

router.get("/flights", async (_req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable).orderBy(flightsTable.id);
  const mapped = flights.map((f) => ({
    ...f,
    price: Number(f.price),
    airlineLogoUrl: f.airlineLogoUrl ?? undefined,
  }));
  res.json(ListFlightsResponse.parse(mapped));
});

router.get("/flights/:id", async (req, res): Promise<void> => {
  const params = GetFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flight] = await db
    .select()
    .from(flightsTable)
    .where(eq(flightsTable.id, params.data.id));

  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.json(GetFlightResponse.parse({ ...flight, price: Number(flight.price), airlineLogoUrl: flight.airlineLogoUrl ?? undefined }));
});

export default router;
