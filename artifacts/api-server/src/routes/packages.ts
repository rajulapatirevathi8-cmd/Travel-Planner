import { Router, type IRouter } from "express";
import { ilike, eq } from "drizzle-orm";
import { db, packagesTable, destinationsTable } from "@workspace/db";
import {
  ListPackagesQueryParams,
  ListPackagesResponse,
  GetPackageParams,
  GetPackageResponse,
  GetPopularDestinationsResponse,
  GetFeaturedDealsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const parsed = ListPackagesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { destination, type } = parsed.data;

  let query = db.select().from(packagesTable).$dynamic();

  const conditions = [];
  if (destination) {
    conditions.push(ilike(packagesTable.destination, `%${destination}%`));
  }
  if (type) {
    conditions.push(eq(packagesTable.type, type));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const packages = await query.orderBy(packagesTable.id);
  const mapped = packages.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: Number(p.rating),
    imageUrl: p.imageUrl ?? undefined,
    description: p.description ?? undefined,
  }));
  res.json(ListPackagesResponse.parse(mapped));
});

router.get("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pkg] = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.id, params.data.id));

  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }

  res.json(
    GetPackageResponse.parse({
      ...pkg,
      price: Number(pkg.price),
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
      rating: Number(pkg.rating),
      imageUrl: pkg.imageUrl ?? undefined,
      description: pkg.description ?? undefined,
    })
  );
});

router.get("/destinations/popular", async (_req, res): Promise<void> => {
  const destinations = await db
    .select()
    .from(destinationsTable)
    .orderBy(destinationsTable.id)
    .limit(8);

  const mapped = destinations.map((d) => ({
    ...d,
    startingPrice: Number(d.startingPrice),
    rating: Number(d.rating),
    imageUrl: d.imageUrl ?? undefined,
  }));
  res.json(GetPopularDestinationsResponse.parse(mapped));
});

router.get("/deals/featured", async (_req, res): Promise<void> => {
  const packages = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.featured, true))
    .orderBy(packagesTable.id)
    .limit(6);

  const deals = packages.map((p) => {
    const original = p.originalPrice ? Number(p.originalPrice) : Number(p.price) * 1.2;
    const discounted = Number(p.price);
    const discountPercent = Math.round(((original - discounted) / original) * 100);
    return {
      id: p.id,
      title: p.name,
      description: p.description ?? `${p.duration} days in ${p.destination}`,
      type: "package" as const,
      originalPrice: original,
      discountedPrice: discounted,
      discountPercent,
      imageUrl: p.imageUrl ?? undefined,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      referenceId: p.id,
    };
  });

  res.json(GetFeaturedDealsResponse.parse(deals));
});

export default router;
