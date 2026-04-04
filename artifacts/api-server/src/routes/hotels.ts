import { Router, type IRouter } from "express";
import { ilike, eq } from "drizzle-orm";
import { db, hotelsTable } from "@workspace/db";
import {
  SearchHotelsQueryParams,
  SearchHotelsResponse,
  ListHotelsResponse,
  GetHotelParams,
  GetHotelResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/hotels/search", async (req, res): Promise<void> => {
  const parsed = SearchHotelsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { location, stars } = parsed.data;

  let query = db.select().from(hotelsTable).$dynamic();

  const conditions = [];
  if (location) {
    conditions.push(ilike(hotelsTable.location, `%${location}%`));
  }
  if (stars) {
    conditions.push(eq(hotelsTable.stars, stars));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const hotels = await query;
  const mapped = hotels.map((h) => ({
    ...h,
    rating: Number(h.rating),
    pricePerNight: Number(h.pricePerNight),
    imageUrl: h.imageUrl ?? undefined,
    address: h.address ?? undefined,
    description: h.description ?? undefined,
  }));
  res.json(SearchHotelsResponse.parse(mapped));
});

router.get("/hotels", async (_req, res): Promise<void> => {
  const hotels = await db.select().from(hotelsTable).orderBy(hotelsTable.id);
  const mapped = hotels.map((h) => ({
    ...h,
    rating: Number(h.rating),
    pricePerNight: Number(h.pricePerNight),
    imageUrl: h.imageUrl ?? undefined,
    address: h.address ?? undefined,
    description: h.description ?? undefined,
  }));
  res.json(ListHotelsResponse.parse(mapped));
});

router.get("/hotels/:id", async (req, res): Promise<void> => {
  const params = GetHotelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [hotel] = await db
    .select()
    .from(hotelsTable)
    .where(eq(hotelsTable.id, params.data.id));

  if (!hotel) {
    res.status(404).json({ error: "Hotel not found" });
    return;
  }

  res.json(
    GetHotelResponse.parse({
      ...hotel,
      rating: Number(hotel.rating),
      pricePerNight: Number(hotel.pricePerNight),
      imageUrl: hotel.imageUrl ?? undefined,
      address: hotel.address ?? undefined,
      description: hotel.description ?? undefined,
    })
  );
});

export default router;
