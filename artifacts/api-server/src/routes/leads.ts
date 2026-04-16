import { Router } from "express";
import { eq, and, desc, gte } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";
import {
  sendLeadAdminAlert,
  sendLeadCustomerConfirmation,
  sendAbandonedLeadReminder,
  sendStaffFollowUpReminder,
} from "../lib/whatsapp-service.js";

const router = Router();

// GET /leads — list all leads (optional ?status=&type=&assignedTo=)
router.get("/leads", async (req, res): Promise<void> => {
  try {
    const { status, type, assignedTo } = req.query as Record<string, string>;
    const rows = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));

    const filtered = rows.filter((l) => {
      if (status     && l.status     !== status)     return false;
      if (type       && l.type       !== type)       return false;
      if (assignedTo && l.assignedTo !== assignedTo) return false;
      return true;
    });

    res.json(filtered.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })));
  } catch (err: any) {
    console.error("[leads] GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /leads/convert — mark lead booked by phone+type (must come before /:leadId)
router.post("/leads/convert", async (req, res): Promise<void> => {
  try {
    const { phone, type, bookingRef } = req.body as { phone: string; type: string; bookingRef?: string };
    if (!phone || !type) { res.status(400).json({ error: "phone and type required" }); return; }

    const existing = await db
      .select()
      .from(leadsTable)
      .where(and(eq(leadsTable.phone, phone), eq(leadsTable.type, type)));

    if (existing.length === 0) { res.json({ skipped: true }); return; }

    const [updated] = await db
      .update(leadsTable)
      .set({ status: "booked", bookingRef: bookingRef ?? null, updatedAt: new Date() })
      .where(eq(leadsTable.id, existing[0].id))
      .returning();

    res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[leads] convert error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /leads — create a lead with smart duplicate control
// Dedup rules:
//   - Holiday + packageId provided: same phone + packageId within 1 hour → skip
//   - All others (flight/bus/hotel): same phone + type within 1 hour → skip
router.post("/leads", async (req, res): Promise<void> => {
  try {
    const {
      name, phone, email,
      type = "flight",
      source = "form",
      status = "new",
      packageId,
      packageName,
      notes,
    } = req.body as {
      name: string; phone: string; email?: string;
      type?: string; source?: string; status?: string;
      packageId?: number; packageName?: string; notes?: string;
    };

    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // ── Duplicate check ────────────────────────────────────────────────────────
    if (packageId) {
      // Holiday lead: dedup by phone + packageId within 1 hour
      const existing = await db
        .select()
        .from(leadsTable)
        .where(
          and(
            eq(leadsTable.phone, phone),
            eq(leadsTable.packageId, packageId),
            gte(leadsTable.createdAt, oneHourAgo),
          ),
        );

      if (existing.length > 0) {
        const lead = existing[0];
        res.json({ ...lead, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt.toISOString() });
        return;
      }
    } else {
      // Other leads: dedup by phone + type within 1 hour (skip if already booked)
      const existing = await db
        .select()
        .from(leadsTable)
        .where(
          and(
            eq(leadsTable.phone, phone),
            eq(leadsTable.type, type),
            gte(leadsTable.createdAt, oneHourAgo),
          ),
        );

      if (existing.length > 0) {
        const lead = existing[0];
        if (lead.status === "booked") {
          res.json({ ...lead, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt.toISOString() });
          return;
        }
        const [updated] = await db
          .update(leadsTable)
          .set({ name, email: email ?? lead.email, notes: notes ?? lead.notes, updatedAt: new Date() })
          .where(eq(leadsTable.id, lead.id))
          .returning();
        res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
        return;
      }
    }

    // ── Create new lead ────────────────────────────────────────────────────────
    const leadId = `LD-${Date.now()}`;
    const [created] = await db
      .insert(leadsTable)
      .values({
        leadId,
        name,
        phone,
        email:       email       ?? null,
        type,
        source,
        status,
        packageId:   packageId   ?? null,
        packageName: packageName ?? null,
        notes:       notes       ?? null,
      })
      .returning();

    // ── WhatsApp: notify admin + confirm to customer (fire-and-forget) ─────────
    const notifData = {
      leadId: created.leadId,
      name:   created.name,
      phone:  created.phone,
      type:   created.type,
      email:  created.email ?? undefined,
    };
    sendLeadAdminAlert(notifData).catch(() => {});
    sendLeadCustomerConfirmation(notifData).catch(() => {});

    // ── 30-min staff follow-up reminder if lead still not contacted ────────────
    setTimeout(async () => {
      try {
        const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.leadId, leadId));
        if (lead && lead.status === "new") {
          console.info(`[leads] 30-min elapsed, lead ${leadId} still new — sending staff reminder`);
          sendStaffFollowUpReminder(notifData).catch(() => {});
          await db.update(leadsTable).set({ notes: (lead.notes ? lead.notes + " | " : "") + "Auto 30-min reminder sent" }).where(eq(leadsTable.leadId, leadId));
        }
      } catch (err) {
        console.error("[leads] 30-min followup error:", err);
      }
    }, 30 * 60 * 1000);

    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[leads] POST error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /leads/abandoned — save abandoned search lead + send WhatsApp reminder (must come before /:leadId)
router.post("/leads/abandoned", async (req, res): Promise<void> => {
  try {
    const { name, phone, type = "flight", notes, email } = req.body as {
      name: string; phone: string; type?: string; notes?: string; email?: string;
    };
    if (!name || !phone) { res.status(400).json({ error: "name and phone required" }); return; }

    // Dedup: same phone + type as abandoned within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const existing = await db
      .select()
      .from(leadsTable)
      .where(and(eq(leadsTable.phone, phone), eq(leadsTable.type, type), eq(leadsTable.status, "abandoned"), gte(leadsTable.createdAt, twoHoursAgo)));

    if (existing.length > 0) {
      res.json({ ...existing[0], createdAt: existing[0].createdAt.toISOString(), updatedAt: existing[0].updatedAt.toISOString() });
      return;
    }

    const leadId = `LD-${Date.now()}`;
    const [created] = await db
      .insert(leadsTable)
      .values({ leadId, name, phone, email: email ?? null, type, source: "auto", status: "abandoned", notes: notes ?? null })
      .returning();

    // Send admin alert + customer WhatsApp reminder
    const notifData = { leadId: created.leadId, name: created.name, phone: created.phone, type: created.type };
    sendLeadAdminAlert(notifData).catch(() => {});
    sendAbandonedLeadReminder(notifData).catch(() => {});

    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[leads] abandoned POST error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /leads/:leadId — update status, assignedTo, notes, bookingRef
router.patch("/leads/:leadId", async (req, res): Promise<void> => {
  try {
    const { leadId } = req.params;
    const { status, assignedTo, assignedName, notes, bookingRef } = req.body as {
      status?: string; assignedTo?: string; assignedName?: string; notes?: string; bookingRef?: string;
    };

    const existing = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.leadId, leadId));

    if (existing.length === 0) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status       !== undefined) updates.status = status;
    if (assignedTo   !== undefined) updates.assignedTo = assignedTo;
    if (assignedName !== undefined) updates.assignedName = assignedName;
    if (notes        !== undefined) updates.notes = notes;
    if (bookingRef   !== undefined) updates.bookingRef = bookingRef;

    const [updated] = await db
      .update(leadsTable)
      .set(updates)
      .where(eq(leadsTable.leadId, leadId))
      .returning();

    res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[leads] PATCH error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
