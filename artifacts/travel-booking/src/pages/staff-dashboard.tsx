import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  Phone, MessageCircle, RefreshCw, LogOut, UserCircle, StickyNote,
  Plane, CalendarDays, TrendingUp, IndianRupee, MapPin, Calendar,
  Clock, CheckCircle2, XCircle, Users, BookOpen, ChevronRight, ClipboardList,
} from "lucide-react";
import {
  fetchLeads, updateLeadStatus, addLeadNotes,
  STATUS_META, TYPE_META,
  type CrmLead, type LeadStatus,
} from "@/lib/crm";
import {
  getFollowUps, setFollowUp, getFollowUp, getTodayFollowUps,
  getStaffBookings, getIncentiveConfig,
  type StaffBookingRecord, type FollowUp,
} from "@/lib/staff-data";

const STAFF_STATUSES: LeadStatus[] = ["new", "contacted", "interested", "booked", "lost"];

const STAFF_STATUS_LABEL: Record<string, string> = {
  new:        "New",
  contacted:  "Contacted",
  interested: "Interested",
  booked:     "Converted",
  lost:       "Cancelled",
};

const STAFF_STATUS_COLOR: Record<string, string> = {
  new:        "bg-blue-100 text-blue-800",
  contacted:  "bg-yellow-100 text-yellow-800",
  interested: "bg-purple-100 text-purple-800",
  booked:     "bg-green-100 text-green-800",
  lost:       "bg-red-100 text-red-800",
};

type Tab = "leads" | "bookings" | "earnings";

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { user, isStaff, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [leads,     setLeads]     = useState<CrmLead[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [notesLead, setNotesLead] = useState<CrmLead | null>(null);
  const [notesText, setNotesText] = useState("");

  const [followUpLead,  setFollowUpLead]  = useState<CrmLead | null>(null);
  const [followUpDate,  setFollowUpDate]  = useState("");
  const [followUpNote,  setFollowUpNote]  = useState("");

  const [followUps, setFollowUps]   = useState<FollowUp[]>([]);
  const [bookings,  setBookings]    = useState<StaffBookingRecord[]>([]);

  const loadLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchLeads({ assignedTo: user.id });
    setLeads(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isStaff) { setLocation("/login"); return; }
    loadLeads();
    if (user) {
      setFollowUps(getFollowUps(user.id));
      setBookings(getStaffBookings(user.id));
    }
  }, [isStaff, loadLeads, setLocation, user]);

  if (!isStaff) return null;

  const today = new Date().toISOString().split("T")[0];
  const todayFollowUps = followUps.filter((f) => f.date === today);

  const stats = {
    total:      leads.length,
    followUps:  todayFollowUps.length,
    converted:  leads.filter((l) => l.status === "booked").length,
    bookings:   bookings.length,
  };

  const totalIncentive = bookings.reduce((s, b) => s + b.incentive, 0);

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
    }
    return true;
  });

  async function handleStatusChange(lead: CrmLead, status: LeadStatus) {
    await updateLeadStatus(lead.leadId, status);
    setLeads((prev) => prev.map((l) => l.leadId === lead.leadId ? { ...l, status } : l));
    toast({ title: `Status updated to "${STAFF_STATUS_LABEL[status] ?? status}"` });
  }

  async function handleSaveNotes() {
    if (!notesLead) return;
    await addLeadNotes(notesLead.leadId, notesText);
    setLeads((prev) => prev.map((l) =>
      l.leadId === notesLead.leadId ? { ...l, notes: notesText } : l
    ));
    setNotesLead(null);
    toast({ title: "Notes saved" });
  }

  function openFollowUp(lead: CrmLead) {
    const existing = user ? getFollowUp(lead.leadId, user.id) : undefined;
    setFollowUpDate(existing?.date ?? "");
    setFollowUpNote(existing?.note ?? "");
    setFollowUpLead(lead);
  }

  function handleSaveFollowUp() {
    if (!followUpLead || !user) return;
    setFollowUp(followUpLead.leadId, user.id, followUpDate, followUpNote);
    setFollowUps(getFollowUps(user.id));
    setFollowUpLead(null);
    toast({ title: followUpDate ? `Follow-up set for ${followUpDate}` : "Follow-up cleared" });
  }

  function formatDate(d: string) {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b shadow-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-slate-900 text-sm leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-400 leading-tight">Sales Staff</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Tab nav */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["leads", "bookings", "earnings"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "leads"    ? `Leads (${stats.total})`        :
               tab === "bookings" ? `Bookings (${stats.bookings})`  :
               "Earnings"}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 ml-2">
          <Button
            variant="outline" size="sm" className="h-8 px-2.5 gap-1 text-purple-700 border-purple-200 hover:bg-purple-50 text-xs font-semibold"
            onClick={() => setLocation("/staff/crm")}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My CRM</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2" onClick={loadLeads} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost" size="sm" className="h-8 px-2 text-slate-500"
            onClick={() => { logout(); setLocation("/staff-login"); }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,       label: "Assigned Leads",    value: stats.total,     color: "text-slate-700",  bg: "bg-slate-50" },
            { icon: CalendarDays,label: "Today's Follow-ups", value: stats.followUps, color: "text-blue-600",   bg: "bg-blue-50" },
            { icon: CheckCircle2,label: "Converted",          value: stats.converted, color: "text-green-600",  bg: "bg-green-50" },
            { icon: IndianRupee, label: "Incentive Earned",   value: `₹${totalIncentive.toLocaleString("en-IN")}`, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm border-0">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <s.icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${s.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Today's Follow-ups banner ── */}
        {activeTab === "leads" && todayFollowUps.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800">
                {todayFollowUps.length} follow-up{todayFollowUps.length > 1 ? "s" : ""} due today
              </p>
              <p className="text-xs text-blue-600">
                {leads.filter((l) => todayFollowUps.some((f) => f.leadId === l.leadId)).map((l) => l.name).join(", ")}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0 text-xs"
              onClick={() => setStatusFilter("all")}
            >
              View All
            </Button>
          </div>
        )}

        {/* ── Quick Booking Shortcuts ── */}
        {activeTab === "leads" && (
          <div className="flex gap-2 flex-wrap">
            <Link href="/flights">
              <Button size="sm" variant="outline" className="gap-1.5 text-sm border-slate-300 hover:border-blue-400 hover:text-blue-600">
                <Plane className="w-3.5 h-3.5" /> Book Flight
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="sm" variant="outline" className="gap-1.5 text-sm border-slate-300 hover:border-pink-400 hover:text-pink-600">
                <MapPin className="w-3.5 h-3.5" /> Holiday Enquiry
              </Button>
            </Link>
            <Link href="/hotels">
              <Button size="sm" variant="outline" className="gap-1.5 text-sm border-slate-300 hover:border-teal-400 hover:text-teal-600">
                <BookOpen className="w-3.5 h-3.5" /> Book Hotel
              </Button>
            </Link>
          </div>
        )}

        {/* ════════════════ LEADS TAB ════════════════ */}
        {activeTab === "leads" && (
          <>
            {/* Search + filter */}
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search name or phone…"
                className="flex-1 min-w-[200px] h-9 text-sm bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-36 text-sm bg-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STAFF_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STAFF_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Loading your leads…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No leads found.</p>
                <p className="text-slate-300 text-xs mt-1">Ask your admin to assign leads to you.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((lead) => {
                  const tm        = TYPE_META[lead.type] ?? { label: lead.type, color: "bg-slate-100 text-slate-700" };
                  const statusLbl = STAFF_STATUS_LABEL[lead.status] ?? lead.status;
                  const statusClr = STAFF_STATUS_COLOR[lead.status] ?? "bg-slate-100 text-slate-700";
                  const fu        = user ? getFollowUp(lead.leadId, user.id) : undefined;
                  const isDueToday = fu?.date === today;
                  return (
                    <Card
                      key={lead.id}
                      className={`overflow-hidden shadow-sm transition-all ${isDueToday ? "border-blue-300 ring-1 ring-blue-200" : "border"}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900 text-sm">{lead.name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tm.color}`}>{tm.label}</span>
                              {isDueToday && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> Follow-up today
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">{lead.phone}</p>
                            {lead.email && <p className="text-xs text-slate-400">{lead.email}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClr}`}>
                              {statusLbl}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {lead.notes && (
                          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
                            📝 {lead.notes}
                          </p>
                        )}

                        {/* Follow-up date display */}
                        {fu?.date && (
                          <p className="text-xs text-blue-600 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Follow-up: {formatDate(fu.date)}
                            {fu.note && ` — ${fu.note}`}
                          </p>
                        )}

                        {/* Actions row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={lead.status}
                            onValueChange={(v) => handleStatusChange(lead, v as LeadStatus)}
                          >
                            <SelectTrigger className={`h-8 text-xs flex-1 font-semibold border-0 shadow-none rounded-full px-3 ${statusClr}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAFF_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{STAFF_STATUS_LABEL[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                              target="_blank" rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                              title="Add notes"
                              onClick={() => { setNotesLead(lead); setNotesText(lead.notes ?? ""); }}
                            >
                              <StickyNote className="w-4 h-4" />
                            </button>
                            <button
                              className={`p-2 rounded-xl transition-colors ${fu?.date ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}
                              title="Set follow-up date"
                              onClick={() => openFollowUp(lead)}
                            >
                              <CalendarDays className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════ BOOKINGS TAB ════════════════ */}
        {activeTab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="py-16 text-center">
                <Plane className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No bookings done yet.</p>
                <p className="text-slate-300 text-xs mt-1">Book flights, hotels or buses for customers to earn incentives.</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">{bookings.length} bookings completed</p>
                    <p className="text-xs text-green-600">Total incentive: ₹{totalIncentive.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {bookings.map((b) => {
                  const tm = TYPE_META[b.type] ?? { label: b.type, color: "bg-slate-100 text-slate-700" };
                  return (
                    <Card key={b.id} className="shadow-sm border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tm.color}`}>{tm.label}</span>
                              <span className="text-xs text-slate-400 font-mono">{b.bookingRef}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">{b.customerName}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              {" · "} ₹{b.amount.toLocaleString("en-IN")} booking
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-slate-400">Your incentive</p>
                            <p className="text-lg font-extrabold text-green-600">+₹{b.incentive}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ════════════════ EARNINGS TAB ════════════════ */}
        {activeTab === "earnings" && (
          <div className="space-y-4">
            {/* Summary card */}
            <Card className="border-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-purple-200 mb-1">Total Incentives Earned</p>
                <p className="text-4xl font-extrabold mb-3">₹{totalIncentive.toLocaleString("en-IN")}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-300">Bookings Done</p>
                    <p className="text-xl font-bold">{bookings.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300">Per Booking</p>
                    <p className="text-xl font-bold">₹{getIncentiveConfig().fixedAmount}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead conversion stats */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-slate-700">Lead Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {[
                  { label: "Total Assigned",   value: stats.total,                    color: "bg-slate-200" },
                  { label: "Contacted",         value: leads.filter((l) => l.status === "contacted").length,  color: "bg-yellow-400" },
                  { label: "Interested",        value: leads.filter((l) => l.status === "interested").length, color: "bg-purple-400" },
                  { label: "Converted (Booked)",value: stats.converted,               color: "bg-green-400" },
                  { label: "Cancelled (Lost)",  value: leads.filter((l) => l.status === "lost").length,       color: "bg-red-400" },
                ].map((row) => {
                  const pct = stats.total > 0 ? Math.round((row.value / stats.total) * 100) : 0;
                  return (
                    <div key={row.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">{row.label}</span>
                        <span className="font-semibold text-slate-800">{row.value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Incentive rules */}
            <Card className="shadow-sm border bg-slate-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Incentive Rules</p>
                {(() => {
                  const cfg = getIncentiveConfig();
                  return [
                    { rule: "Fixed per booking",      reward: `₹${cfg.fixedAmount}` },
                    { rule: "% of booking profit",    reward: `${cfg.profitPercent}%` },
                  ];
                })().map((r) => (
                  <div key={r.rule} className="flex justify-between text-sm">
                    <span className="text-slate-600">{r.rule}</span>
                    <span className="font-bold text-green-600">{r.reward}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Notes dialog ── */}
      <Dialog open={!!notesLead} onOpenChange={(o) => !o && setNotesLead(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Notes — {notesLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Textarea
              rows={4}
              placeholder="Add notes about this lead…"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setNotesLead(null)}>Cancel</Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSaveNotes}>Save Notes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Follow-up dialog ── */}
      <Dialog open={!!followUpLead} onOpenChange={(o) => !o && setFollowUpLead(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Follow-up — {followUpLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs mb-1 block">Follow-up Date</Label>
              <Input
                type="date"
                value={followUpDate}
                min={today}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Note (optional)</Label>
              <Input
                placeholder="e.g. Call about Goa package pricing"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setFollowUpLead(null)}>Cancel</Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-500 hover:bg-red-50"
                onClick={() => { setFollowUpDate(""); handleSaveFollowUp(); }}
              >
                Clear
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveFollowUp}
                disabled={!followUpDate}
              >
                Set Follow-up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
