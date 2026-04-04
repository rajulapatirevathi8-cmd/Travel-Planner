import { Router, type IRouter } from "express";
import { ilike, eq } from "drizzle-orm";
import { db, busesTable } from "@workspace/db";
import {
  SearchBusesQueryParams,
  SearchBusesResponse,
  ListBusesResponse,
  GetBusParams,
  GetBusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/buses/search", async (req, res): Promise<void> => {
  const parsed = SearchBusesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { origin, destination } = parsed.data;

  let query = db.select().from(busesTable).$dynamic();

  const conditions = [];
  if (origin) {
    conditions.push(ilike(busesTable.origin, `%${origin}%`));
  }
  if (destination) {
    conditions.push(ilike(busesTable.destination, `%${destination}%`));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const buses = await query;
  const mapped = buses.map((b) => ({
    ...b,
    price: Number(b.price),
  }));
  res.json(SearchBusesResponse.parse(mapped));
});

router.get("/buses", async (_req, res): Promise<void> => {
  const buses = await db.select().from(busesTable).orderBy(busesTable.id);
  const mapped = buses.map((b) => ({
    ...b,
    price: Number(b.price),
  }));
  res.json(ListBusesResponse.parse(mapped));
});

router.get("/buses/:id", async (req, res): Promise<void> => {
  const params = GetBusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [bus] = await db
    .select()
    .from(busesTable)
    .where(eq(busesTable.id, params.data.id));

  if (!bus) {
    res.status(404).json({ error: "Bus not found" });
    return;
  }

  res.json(GetBusResponse.parse({ ...bus, price: Number(bus.price) }));
});

export default router;
