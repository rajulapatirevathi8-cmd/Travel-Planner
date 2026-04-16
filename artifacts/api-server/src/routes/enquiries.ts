import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, enquiriesTable } from "@workspace/db";

const router = Router();

// GET /enquiries — list all, optional ?packageId=&userId=&phone=
router.get("/enquiries", async (req, res): Promise<void> => {
  try {
    const { packageId, userId, phone } = req.query as Record<string, string>;
    const rows = await db
      .select()
      .from(enquiriesTable)
      .orderBy(desc(enquiriesTable.createdAt));

    const filtered = rows.filter((e) => {
      if (packageId && String(e.packageId) !== packageId) return false;
      if (userId    && e.userId !== userId)               return false;
      if (phone     && e.phone  !== phone)                return false;
      return true;
    });

    res.json(filtered.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })));
  } catch (err: any) {
    console.error("[enquiries] GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /enquiries/check — check if enquiry exists for phone+packageId (or userId+packageId)
router.get("/enquiries/check", async (req, res): Promise<void> => {
  try {
    const { packageId, userId, phone } = req.query as Record<string, string>;
    if (!packageId) { res.status(400).json({ error: "packageId required" }); return; }

    const rows = await db
      .select()
      .from(enquiriesTable)
      .where(eq(enquiriesTable.packageId, Number(packageId)));

    const exists = rows.some((e) => {
      if (userId && e.userId === userId) return true;
      if (phone  && e.phone  === phone)  return true;
      return false;
    });

    res.json({ exists });
  } catch (err: any) {
    console.error("[enquiries] check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /enquiries — create enquiry (dedup: same phone+packageId → skip)
router.post("/enquiries", async (req, res): Promise<void> => {
  try {
    const {
      packageId, packageName, destination,
      name, phone, email, userId,
      source = "guest", agentId, agentName,
      travelDate, people, notes,
    } = req.body as {
      packageId: number; packageName: string; destination: string;
      name: string; phone: string; email?: string; userId?: string;
      source?: string; agentId?: string; agentName?: string;
      travelDate?: string; people?: number; notes?: string;
    };

    // phone OR userId must be provided (customers may have no phone set)
    if (!packageId || !name || (!phone && !userId)) {
      res.status(400).json({ error: "packageId, name and (phone or userId) are required" });
      return;
    }

    // Dedup: same (phone OR userId) + packageId → return existing
    const existingRows = await db
      .select()
      .from(enquiriesTable)
      .where(eq(enquiriesTable.packageId, packageId));

    const existing = existingRows.filter((e) => {
      if (phone  && e.phone  === phone)   return true;
      if (userId && e.userId === userId)   return true;
      return false;
    });

    if (existing.length > 0) {
      const e = existing[0];
      res.json({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString(), duplicate: true });
      return;
    }

    const enquiryId = `ENQ-${Date.now()}`;
    const [created] = await db
      .insert(enquiriesTable)
      .values({
        enquiryId,
        packageId,
        packageName,
        destination,
        name,
        phone,
        email:      email      ?? null,
        userId:     userId     ?? null,
        source,
        agentId:    agentId    ?? null,
        agentName:  agentName  ?? null,
        travelDate: travelDate ?? null,
        people:     people     ?? 2,
        notes:      notes      ?? null,
        status:     "enquiry",
      })
      .returning();

    res.status(201).json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[enquiries] POST error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /enquiries/:enquiryId — update status or notes
router.patch("/enquiries/:enquiryId", async (req, res): Promise<void> => {
  try {
    const { enquiryId } = req.params;
    const { status, notes } = req.body as { status?: string; notes?: string };

    const existing = await db
      .select()
      .from(enquiriesTable)
      .where(eq(enquiriesTable.enquiryId, enquiryId));

    if (existing.length === 0) { res.status(404).json({ error: "Enquiry not found" }); return; }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (notes  !== undefined) updates.notes  = notes;

    const [updated] = await db
      .update(enquiriesTable)
      .set(updates)
      .where(eq(enquiriesTable.enquiryId, enquiryId))
      .returning();

    res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[enquiries] PATCH error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
