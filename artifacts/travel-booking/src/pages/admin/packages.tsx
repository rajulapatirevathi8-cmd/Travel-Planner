import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Search, Map, RefreshCw, ArrowLeft,
  Bot, ShieldCheck, Loader2, ImageOff,
  IndianRupee, Eye, EyeOff, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface DbPackage {
  id: number;
  name: string;
  destination: string;
  type: string;
  packageType: string | null;
  category: string | null;
  markupPct: number | null;
  duration: number;
  nights: number;
  durationLabel: string;
  pricePerPerson: number;
  finalPrice: number;
  aiPrice: number | null;
  adminPrice: number | null;
  basePrice: number;
  rating: number;
  ratingCount: number;
  images: string[];
  highlights: string[];
  description: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: object[] | null;
  featured: boolean;
  isEnabled: boolean;
  createdBy: string;
  createdAt: string;
}

const TYPES = ["beach", "adventure", "cultural", "luxury", "family", "honeymoon", "hill", "wildlife"];
const TYPE_COLORS: Record<string, string> = {
  beach: "bg-blue-100 text-blue-700",
  adventure: "bg-orange-100 text-orange-700",
  cultural: "bg-purple-100 text-purple-700",
  luxury: "bg-yellow-100 text-yellow-800",
  family: "bg-green-100 text-green-700",
  honeymoon: "bg-pink-100 text-pink-700",
  hill: "bg-emerald-100 text-emerald-700",
  wildlife: "bg-teal-100 text-teal-700",
};

interface ItineraryDayForm {
  day: number;
  title: string;
  description: string;    // activities as a single string description
  meals: string;
  hotel: string;
}

const PACKAGE_AUDIENCE_OPTIONS = [
  { value: "",          label: "— No specific audience —" },
  { value: "honeymoon", label: "💑 Honeymoon / Couples" },
  { value: "family",    label: "👨‍👩‍👧‍👦 Family" },
  { value: "friends",   label: "👥 Friends / Group" },
  { value: "budget",    label: "💰 Budget" },
  { value: "luxury",    label: "👑 Luxury" },
];

const CATEGORY_OPTIONS = [
  { value: "",              label: "— Unassigned —" },
  { value: "domestic",     label: "🇮🇳 Domestic" },
  { value: "international", label: "✈️ International" },
  { value: "devotional",   label: "🛕 Devotional" },
];

const EMPTY_FORM = {
  name: "", destination: "", type: "beach", packageType: "", category: "",
  duration: 4, nights: 3, pricePerPerson: 12000, adminPrice: "",
  markupPct: "",
  images: "", highlights: "", description: "",
  inclusions: "", exclusions: "", featured: false, isEnabled: true,
};

function blankDay(dayNum: number): ItineraryDayForm {
  return { day: dayNum, title: "", description: "", meals: "Breakfast, Dinner", hotel: "Hotel" };
}

export default function AdminPackages() {
  const { toast }           = useToast();
  const [, setLocation]     = useLocation();
  const [packages, setPkgs] = useState<DbPackage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [sourceFilter, setSourceFilter] = useState<"" | "admin" | "ai">("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<DbPackage | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [priceModal, setPriceModal] = useState<DbPackage | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  // ── Itinerary state ────────────────────────────────────────────────────────
  const [itineraryDays, setItineraryDays] = useState<ItineraryDayForm[]>([]);
  const [generatingAI,  setGeneratingAI]  = useState(false);

  useEffect(() => { fetchPackages(); }, []);

  async function fetchPackages() {
    setLoading(true);
    try {
      // Admin view: include disabled packages too
      const res = await fetch("/api/holiday-packages?includeDisabled=true");
      if (!res.ok) throw new Error("fetch failed");
      setPkgs(await res.json());
    } catch {
      toast({ title: "Failed to load packages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setItineraryDays([]);
    setShowForm(true);
  }

  function openEditForm(pkg: DbPackage) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      destination: pkg.destination,
      type: pkg.type,
      packageType: pkg.packageType ?? "",
      category: pkg.category ?? "",
      markupPct: pkg.markupPct !== null && pkg.markupPct !== undefined ? String(pkg.markupPct) : "",
      duration: pkg.duration,
      nights: pkg.nights,
      pricePerPerson: pkg.basePrice ?? pkg.pricePerPerson,
      adminPrice: pkg.adminPrice !== null ? String(pkg.adminPrice) : "",
      images: pkg.images.join("\n"),
      highlights: pkg.highlights.join(", "),
      description: pkg.description,
      inclusions: pkg.inclusions.join("\n"),
      exclusions: pkg.exclusions.join("\n"),
      featured: pkg.featured,
      isEnabled: pkg.isEnabled,
    });
    // Populate itinerary from saved data (supports both new {description,hotel} and legacy {activities,accommodation})
    if (pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0) {
      setItineraryDays(
        (pkg.itinerary as any[]).map((d, i) => ({
          day: d.day ?? (i + 1),
          title: d.title ?? "",
          description: d.description ?? (Array.isArray(d.activities) ? d.activities.join(", ") : (d.activities ?? d.details ?? "")),
          meals: d.meals ?? "",
          hotel: d.hotel ?? d.accommodation ?? "",
        }))
      );
    } else {
      setItineraryDays([]);
    }
    setFormErrors({});
    setShowForm(true);
  }

  // ── Itinerary helpers ──────────────────────────────────────────────────────
  function addItineraryDay() {
    setItineraryDays((prev) => [...prev, blankDay(prev.length + 1)]);
    setFormErrors((p) => ({ ...p, itinerary: "" }));
  }

  function removeItineraryDay(idx: number) {
    setItineraryDays((prev) =>
      prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }))
    );
  }

  function updateItineraryDay(idx: number, field: keyof ItineraryDayForm, value: string) {
    setItineraryDays((prev) =>
      prev.map((d, i) => i === idx ? { ...d, [field]: value } : d)
    );
  }

  async function generateItinerary() {
    const dest = form.destination.trim();
    const dur  = Number(form.duration);
    if (!dest) { toast({ variant: "destructive", title: "Enter a destination first" }); return; }
    setGeneratingAI(true);
    try {
      const params = new URLSearchParams({ destination: dest, duration: String(dur) });
      if (form.packageType) params.set("packageType", form.packageType);
      const res = await fetch(`/api/holiday-packages/generate-itinerary?${params.toString()}`);
      if (!res.ok) throw new Error();
      const { itinerary } = await res.json();
      setItineraryDays(
        (itinerary as any[]).map((d: any, i: number) => ({
          day: d.day ?? (i + 1),
          title: d.title ?? "",
          // API now returns description; fall back for any legacy data
          description: d.description ?? (Array.isArray(d.activities) ? d.activities.join(", ") : (d.activities ?? "")),
          meals: d.meals ?? "",
          hotel: d.hotel ?? d.accommodation ?? "",
        }))
      );
      setFormErrors((p) => ({ ...p, itinerary: "" }));
      toast({ title: "Itinerary generated!", description: `${itinerary.length} days filled in. Review and save.` });
    } catch {
      toast({ variant: "destructive", title: "Generation failed", description: "Could not fetch itinerary template." });
    } finally {
      setGeneratingAI(false);
    }
  }

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.destination.trim()) errs.destination = "Required";
    if (!form.pricePerPerson || form.pricePerPerson <= 0) errs.pricePerPerson = "Must be > 0";
    if (itineraryDays.length === 0) errs.itinerary = "Itinerary required — use 'Generate with AI' or add days manually";
    return errs;
  }

  async function submitForm() {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const adminPriceVal = form.adminPrice.trim() ? Number(form.adminPrice) : undefined;
      // Convert itinerary form rows → API format {day, title, description, meals, hotel}
      const itineraryPayload = itineraryDays.map((d) => ({
        day: d.day,
        title: d.title.trim(),
        description: d.description.trim(),
        meals: d.meals.trim(),
        hotel: d.hotel.trim(),
      }));

      const payload = {
        name: form.name.trim(),
        destination: form.destination.trim(),
        type: form.type,
        duration: Number(form.duration),
        nights: Number(form.nights),
        pricePerPerson: Number(form.pricePerPerson),
        adminPrice: adminPriceVal ?? null,
        images: form.images.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
        highlights: form.highlights.split(",").map((s) => s.trim()).filter(Boolean),
        description: form.description.trim(),
        inclusions: form.inclusions.split("\n").map((s) => s.trim()).filter(Boolean),
        exclusions: form.exclusions.split("\n").map((s) => s.trim()).filter(Boolean),
        itinerary: JSON.stringify(itineraryPayload),
        packageType: form.packageType || null,
        category:    form.category    || null,
        markupPct: form.markupPct !== "" ? Number(form.markupPct) : null,
        featured: form.featured,
        isEnabled: form.isEnabled,
        createdBy: "admin",
      };

      const url    = editing ? `/api/holiday-packages/${editing.id}` : "/api/holiday-packages";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = "Save failed – check itinerary format";
        try {
          const errBody = await res.json();
          errMsg = errBody.error ?? errMsg;
        } catch { /* ignore parse error */ }
        console.error("SAVE ERROR:", errMsg);
        throw new Error(errMsg);
      }

      toast({ title: editing ? "Package updated!" : "Package created!" });
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed – check itinerary format";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deletePackage(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/holiday-packages/${id}`, { method: "DELETE" });
      setPkgs((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Package deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  async function toggleEnabled(pkg: DbPackage) {
    setToggling(pkg.id);
    try {
      const res = await fetch(`/api/holiday-packages/${pkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !pkg.isEnabled }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPkgs((prev) => prev.map((p) => p.id === pkg.id ? { ...p, isEnabled: updated.isEnabled } : p));
      toast({ title: updated.isEnabled ? "Package enabled — now visible to customers" : "Package disabled — hidden from customers" });
    } catch {
      toast({ title: "Toggle failed", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  }

  function openPriceModal(pkg: DbPackage) {
    setPriceModal(pkg);
    setPriceInput(pkg.adminPrice !== null ? String(pkg.adminPrice) : "");
  }

  async function saveAdminPrice() {
    if (!priceModal) return;
    setSavingPrice(true);
    try {
      const adminPriceVal = priceInput.trim() ? Number(priceInput) : null;
      const res = await fetch(`/api/holiday-packages/${priceModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPrice: adminPriceVal }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPkgs((prev) => prev.map((p) => p.id === priceModal.id ? { ...p, ...updated } : p));
      toast({ title: adminPriceVal ? `Admin price set to ₹${adminPriceVal.toLocaleString()}` : "Admin price cleared — using AI price" });
      setPriceModal(null);
    } catch {
      toast({ title: "Failed to update price", variant: "destructive" });
    } finally {
      setSavingPrice(false);
    }
  }

  const filtered = packages.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q);
    const matchType   = !typeFilter || p.type === typeFilter;
    const matchSource = !sourceFilter || p.createdBy === sourceFilter;
    return matchSearch && matchType && matchSource;
  });

  const adminCount   = packages.filter((p) => p.createdBy === "admin").length;
  const aiCount      = packages.filter((p) => p.createdBy === "ai").length;
  const enabledCount = packages.filter((p) => p.isEnabled).length;
  const disabledCount = packages.filter((p) => !p.isEnabled).length;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/crm")} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Package Management</h1>
              <p className="text-sm text-muted-foreground">{packages.length} packages · {adminCount} admin · {aiCount} AI · {enabledCount} live · {disabledCount} hidden</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchPackages} className="gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button onClick={openCreateForm} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Package
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Packages", value: packages.length, color: "bg-purple-50 text-purple-700 border-purple-100" },
            { label: "Admin Created", value: adminCount, color: "bg-blue-50 text-blue-700 border-blue-100", icon: <ShieldCheck className="w-4 h-4" /> },
            { label: "AI Generated", value: aiCount, color: "bg-green-50 text-green-700 border-green-100", icon: <Bot className="w-4 h-4" /> },
            { label: "Live / Hidden", value: `${enabledCount} / ${disabledCount}`, color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Eye className="w-4 h-4" /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className={cn("border rounded-xl p-4 flex items-center justify-between", color)}>
              <div>
                <p className="text-xs font-medium opacity-70">{label}</p>
                <p className="text-2xl font-extrabold">{value}</p>
              </div>
              {icon && <div className="opacity-60">{icon}</div>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search packages…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSourceFilter("")} className={cn("px-3 py-1 rounded-full text-xs font-semibold border", !sourceFilter ? "bg-slate-700 text-white border-slate-700" : "bg-white hover:bg-slate-50")}>All Sources</button>
            <button onClick={() => setSourceFilter("admin")} className={cn("px-3 py-1 rounded-full text-xs font-semibold border gap-1 flex items-center", sourceFilter === "admin" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50 text-blue-700")}>
              <ShieldCheck className="w-3 h-3" /> Admin
            </button>
            <button onClick={() => setSourceFilter("ai")} className={cn("px-3 py-1 rounded-full text-xs font-semibold border gap-1 flex items-center", sourceFilter === "ai" ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-green-50 text-green-700")}>
              <Bot className="w-3 h-3" /> AI
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setTypeFilter("")} className={cn("px-3 py-1 rounded-full text-xs font-semibold border", !typeFilter ? "bg-purple-600 text-white border-purple-600" : "bg-white hover:bg-purple-50")}>All Types</button>
            {TYPES.map((t) => (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                className={cn("px-3 py-1 rounded-full text-xs font-semibold border capitalize", typeFilter === t ? "bg-purple-600 text-white border-purple-600" : "bg-white hover:bg-purple-50")}>{t}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No packages found</p>
            <p className="text-sm mt-1">Try different filters or create a new package</p>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Package</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Price Control</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className={cn("hover:bg-slate-50 transition-colors", !pkg.isEnabled && "opacity-60 bg-slate-50/50")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {pkg.images[0] ? (
                            <img src={pkg.images[0]} alt="" className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-slate-400" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground">{pkg.destination}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold capitalize", TYPE_COLORS[pkg.type] ?? "bg-slate-100 text-slate-700")}>{pkg.type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 hidden sm:table-cell">{pkg.durationLabel}</td>

                    {/* Price Control Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {pkg.createdBy === "ai" && pkg.aiPrice !== null && (
                          <p className="text-xs text-slate-500">AI: ₹{pkg.aiPrice.toLocaleString()}</p>
                        )}
                        {pkg.adminPrice !== null ? (
                          <p className="text-xs text-blue-700 font-semibold">Admin: ₹{pkg.adminPrice.toLocaleString()}</p>
                        ) : pkg.createdBy === "ai" ? (
                          <p className="text-xs text-amber-600 font-semibold">No admin price set</p>
                        ) : null}
                        <p className="font-bold text-slate-900">
                          Final: ₹{pkg.finalPrice?.toLocaleString() ?? pkg.pricePerPerson.toLocaleString()}
                        </p>
                        <button
                          className="text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2 flex items-center gap-0.5"
                          onClick={() => openPriceModal(pkg)}
                        >
                          <IndianRupee className="w-2.5 h-2.5" />
                          {pkg.adminPrice !== null ? "Edit admin price" : "Set admin price"}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      {pkg.createdBy === "ai" ? (
                        <span className="flex items-center gap-1 text-green-700 text-xs font-bold"><Bot className="w-3 h-3" /> AI</span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-700 text-xs font-bold"><ShieldCheck className="w-3 h-3" /> Admin</span>
                      )}
                    </td>

                    {/* Enable/Disable Toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleEnabled(pkg)}
                        disabled={toggling === pkg.id}
                        className={cn("flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors",
                          pkg.isEnabled
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        {toggling === pkg.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : pkg.isEnabled ? (
                          <><Eye className="w-3 h-3" /> Live</>
                        ) : (
                          <><EyeOff className="w-3 h-3" /> Hidden</>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditForm(pkg)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => deletePackage(pkg.id)} disabled={deleting === pkg.id}>
                          {deleting === pkg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Price Control Modal ── */}
      <Dialog open={!!priceModal} onOpenChange={(open) => { if (!open) setPriceModal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-extrabold">
              <IndianRupee className="w-5 h-5 text-purple-600" />
              Admin Price Control
            </DialogTitle>
            <DialogDescription>{priceModal?.name}</DialogDescription>
          </DialogHeader>
          {priceModal && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
                {priceModal.createdBy === "ai" && priceModal.aiPrice !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI Generated Price</span>
                    <span className="font-semibold">₹{priceModal.aiPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Price</span>
                  <span className="font-semibold">₹{(priceModal.basePrice ?? priceModal.pricePerPerson).toLocaleString()}</span>
                </div>
                {priceModal.adminPrice !== null && (
                  <div className="flex justify-between text-blue-700">
                    <span className="font-semibold">Current Admin Override</span>
                    <span className="font-bold">₹{priceModal.adminPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-bold text-green-700">
                  <span>Final Price (what customers see)</span>
                  <span>₹{(priceModal.finalPrice ?? priceModal.pricePerPerson).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Admin Override Price (₹) <span className="text-xs font-normal text-muted-foreground">— leave blank to use AI/base price</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 15000"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, this price overrides everything. Customers only ever see the final price.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPriceModal(null)}>Cancel</Button>
                <Button onClick={saveAdminPrice} disabled={savingPrice} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                  {savingPrice && <Loader2 className="w-4 h-4 animate-spin" />}
                  {priceInput.trim() ? "Set Admin Price" : "Clear Override"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-extrabold">
              {editing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-purple-600" />}
              {editing ? "Edit Package" : "Add New Package"}
            </DialogTitle>
            <DialogDescription>
              {editing ? `Editing: ${editing.name}` : "Fill in the details to create a new holiday package."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Package Name <span className="text-red-500">*</span></label>
                <Input placeholder="e.g. Goa Beach Bliss" value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormErrors((p) => ({ ...p, name: "" })); }}
                  className={cn("h-10", formErrors.name && "border-red-400")} />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Destination <span className="text-red-500">*</span></label>
                <Input placeholder="e.g. Goa" value={form.destination}
                  onChange={(e) => { setForm((f) => ({ ...f, destination: e.target.value })); setFormErrors((p) => ({ ...p, destination: "" })); }}
                  className={cn("h-10", formErrors.destination && "border-red-400")} />
                {formErrors.destination && <p className="text-xs text-red-500 mt-1">{formErrors.destination}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Theme / Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-10 border rounded-lg px-2 text-sm capitalize bg-background">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Audience / Package Type</label>
                <select value={form.packageType} onChange={(e) => setForm((f) => ({ ...f, packageType: e.target.value }))}
                  className="w-full h-10 border rounded-lg px-2 text-sm bg-background">
                  {PACKAGE_AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category <span className="text-xs text-muted-foreground font-normal">(Domestic / Intl / Devotional)</span></label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 border rounded-lg px-2 text-sm bg-background">
                  {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Days</label>
                <Input type="number" min={1} value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value), nights: Number(e.target.value) - 1 }))}
                  className="h-10" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nights</label>
                <Input type="number" min={0} value={form.nights}
                  onChange={(e) => setForm((f) => ({ ...f, nights: Number(e.target.value) }))}
                  className="h-10" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Base Price/Person (₹) <span className="text-red-500">*</span></label>
                <Input type="number" min={0} value={form.pricePerPerson}
                  onChange={(e) => { setForm((f) => ({ ...f, pricePerPerson: Number(e.target.value) })); setFormErrors((p) => ({ ...p, pricePerPerson: "" })); }}
                  className={cn("h-10", formErrors.pricePerPerson && "border-red-400")} />
                {formErrors.pricePerPerson && <p className="text-xs text-red-500 mt-1">{formErrors.pricePerPerson}</p>}
              </div>
            </div>

            {/* Pricing Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Markup % Override
                  <span className="text-xs font-normal text-muted-foreground ml-1">— defaults: honeymoon 30%, luxury 50%, family 20%, friends 15%, budget 5%</span>
                </label>
                <Input type="number" min={0} max={200} placeholder="e.g. 25 (leave blank for default)"
                  value={form.markupPct}
                  onChange={(e) => setForm((f) => ({ ...f, markupPct: e.target.value }))}
                  className="h-10" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Admin Price Override (₹)
                  <span className="text-xs font-normal text-muted-foreground ml-1">— if set, bypasses all markup rules</span>
                </label>
                <Input type="number" min={0} placeholder="Leave blank to use smart pricing"
                  value={form.adminPrice}
                  onChange={(e) => setForm((f) => ({ ...f, adminPrice: e.target.value }))}
                  className="h-10" />
              </div>
            </div>

            {/* Live price preview */}
            {form.pricePerPerson > 0 && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 border text-sm">
                <p className="font-bold text-slate-700 mb-1.5">💡 Smart Pricing Preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground block">Base Price</span><span className="font-bold">₹{Number(form.pricePerPerson).toLocaleString()}</span></div>
                  {form.packageType && !form.markupPct && (
                    <div>
                      <span className="text-muted-foreground block">Type Markup</span>
                      <span className="font-bold text-orange-600">
                        +{form.packageType === "honeymoon" ? 30 : form.packageType === "luxury" ? 50 : form.packageType === "family" ? 20 : form.packageType === "friends" ? 15 : form.packageType === "budget" ? 5 : 0}%
                      </span>
                    </div>
                  )}
                  {form.markupPct && (
                    <div><span className="text-muted-foreground block">Custom Markup</span><span className="font-bold text-orange-600">+{form.markupPct}%</span></div>
                  )}
                  <div>
                    <span className="text-muted-foreground block">Weekend</span>
                    <span className="font-bold text-blue-600">+10%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Peak Season</span>
                    <span className="font-bold text-red-600">+20%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Date-based adjustments are applied dynamically at time of booking.</p>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the package experience…"
                rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Image URLs <span className="text-xs font-normal text-muted-foreground">(one per line)</span></label>
              <textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                placeholder="https://images.unsplash.com/…"
                rows={2} className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Highlights <span className="text-xs font-normal text-muted-foreground">(comma-separated)</span></label>
              <Input value={form.highlights} onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                placeholder="Beach, Fort, Water Sports, Seafood…" className="h-10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Inclusions <span className="text-xs font-normal text-muted-foreground">(one per line)</span></label>
                <textarea value={form.inclusions} onChange={(e) => setForm((f) => ({ ...f, inclusions: e.target.value }))}
                  placeholder="Hotel (3★ Beach Resort)&#10;Daily breakfast&#10;Airport transfers"
                  rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Exclusions <span className="text-xs font-normal text-muted-foreground">(one per line)</span></label>
                <textarea value={form.exclusions} onChange={(e) => setForm((f) => ({ ...f, exclusions: e.target.value }))}
                  placeholder="Flights&#10;Personal expenses&#10;Travel insurance"
                  rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            {/* ── Day-wise Itinerary Editor ── */}
            <div className={cn("border rounded-xl overflow-hidden", formErrors.itinerary && "border-red-400")}>
              <div className="flex items-center justify-between bg-slate-50 border-b px-4 py-2.5">
                <div>
                  <p className="text-sm font-bold text-slate-800">Day-wise Itinerary <span className="text-red-500">*</span></p>
                  <p className="text-xs text-muted-foreground">{itineraryDays.length} day{itineraryDays.length !== 1 ? "s" : ""} · saved to database</p>
                  {formErrors.itinerary && <p className="text-xs text-red-500 mt-0.5">{formErrors.itinerary}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={generateItinerary} disabled={generatingAI}
                    className="gap-1.5 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {generatingAI ? "Generating…" : "Generate with AI"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={addItineraryDay} className="gap-1 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </Button>
                </div>
              </div>

              {itineraryDays.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p className="font-medium">No itinerary yet</p>
                  <p className="text-xs mt-1">Click "Generate with AI" or "Add Day" to build the itinerary</p>
                </div>
              ) : (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {itineraryDays.map((day, idx) => (
                    <div key={idx} className="px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 text-center">
                          Day {day.day}
                        </span>
                        <Input
                          placeholder="Day title (e.g. Arrival & Check-in)"
                          value={day.title}
                          onChange={(e) => updateItineraryDay(idx, "title", e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 shrink-0"
                          onClick={() => removeItineraryDay(idx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Description (e.g. Pickup, hotel check-in, beach visit)"
                        value={day.description}
                        onChange={(e) => updateItineraryDay(idx, "description", e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Meals (e.g. Breakfast, Dinner)"
                          value={day.meals}
                          onChange={(e) => updateItineraryDay(idx, "meals", e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Input
                          placeholder="Hotel (e.g. 3 Star Beach Resort)"
                          value={day.hotel}
                          onChange={(e) => updateItineraryDay(idx, "hotel", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 accent-purple-600" />
                <label htmlFor="featured" className="text-sm font-semibold text-slate-700">Mark as Featured (show on homepage)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isEnabled" checked={form.isEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, isEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="isEnabled" className="text-sm font-semibold text-slate-700">Enabled (visible to customers)</label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={submitForm} disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
