import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  RefreshCw, Search, Phone, Eye, UserCheck, Package,
  Plane, Star, Ghost,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import {
  fetchLeads, updateLeadStatus, STATUS_META, TYPE_META,
  type CrmLead,
} from "@/lib/crm";

const ALL_STATUSES = ["viewed", "guest_lead", "abandoned", "new", "contacted", "interested", "booked", "lost"];
const ALL_TYPES    = ["holiday", "flight", "bus", "hotel"];

const STATUS_ACTIONS: Partial<Record<string, string[]>> = {
  viewed:     ["contacted", "interested", "lost"],
  guest_lead: ["contacted", "interested", "lost"],
  abandoned:  ["contacted", "interested", "lost"],
  new:        ["contacted", "interested", "lost"],
  contacted:  ["interested", "booked", "lost"],
  interested: ["booked", "lost"],
};

function TypeIcon({ type }: { type: string }) {
  if (type === "flight")  return <Plane   className="w-3.5 h-3.5" />;
  if (type === "holiday") return <Package className="w-3.5 h-3.5" />;
  return <Star className="w-3.5 h-3.5" />;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "viewed")     return <Eye      className="w-3 h-3" />;
  if (status === "guest_lead") return <Ghost    className="w-3 h-3" />;
  if (status === "abandoned")  return <Phone    className="w-3 h-3" />;
  if (status === "contacted")  return <Phone    className="w-3 h-3" />;
  if (status === "booked")     return <UserCheck className="w-3 h-3" />;
  return null;
}

export default function AdminLeads() {
  const [, setLocation] = useLocation();
  const { isAdmin }     = useAuth();
  const { toast }       = useToast();

  const [leads,        setLeads]        = useState<CrmLead[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [search,       setSearch]       = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeads();
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (typeFilter   !== "all" && l.type   !== typeFilter)   return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.name.toLowerCase().includes(q) &&
        !l.phone.includes(q) &&
        !(l.packageName ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const stats = {
    total:     leads.length,
    holiday:   leads.filter((l) => l.type === "holiday").length,
    flight:    leads.filter((l) => l.type === "flight").length,
    viewed:    leads.filter((l) => l.status === "viewed").length,
    guest:     leads.filter((l) => l.status === "guest_lead").length,
    abandoned: leads.filter((l) => l.status === "abandoned").length,
  };

  async function changeStatus(lead: CrmLead, newStatus: string) {
    const updated = await updateLeadStatus(lead.leadId, newStatus);
    if (updated) {
      setLeads((prev) => prev.map((l) => l.leadId === lead.leadId ? { ...l, status: newStatus } : l));
      toast({ title: "Status updated", description: `${lead.name} → ${STATUS_META[newStatus]?.label ?? newStatus}` });
    }
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">All Leads</h1>
            <p className="text-sm text-slate-500 mt-0.5">CRM lead tracker — holiday interest + flight abandoned</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadLeads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Total",     value: stats.total,     color: "bg-slate-100  text-slate-700" },
            { label: "Holiday",   value: stats.holiday,   color: "bg-pink-100   text-pink-700" },
            { label: "Flight",    value: stats.flight,    color: "bg-sky-100    text-sky-700" },
            { label: "Viewed",    value: stats.viewed,    color: "bg-slate-100  text-slate-600" },
            { label: "Guest",     value: stats.guest,     color: "bg-indigo-100 text-indigo-700" },
            { label: "Abandoned", value: stats.abandoned, color: "bg-orange-100 text-orange-700" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className={`text-xl font-extrabold ${s.color.split(" ")[1]}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="Search name / phone / package…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-40 text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_META[s]?.label ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {ALL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_META[t]?.label ?? t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="h-9"
                onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setSearch(""); }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Loading leads…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">No leads found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Name / Phone</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Package / Route</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((lead) => {
                    const sm  = STATUS_META[lead.status] ?? { label: lead.status, color: "bg-slate-100 text-slate-700" };
                    const tm  = TYPE_META[lead.type]     ?? { label: lead.type,   color: "bg-slate-100 text-slate-700" };
                    const actions = STATUS_ACTIONS[lead.status] ?? [];
                    const date = new Date(lead.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    });

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{lead.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs font-semibold gap-1 ${tm.color}`}>
                            <TypeIcon type={lead.type} />
                            {tm.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {lead.packageName ? (
                            <span className="text-xs font-medium text-slate-700">{lead.packageName}</span>
                          ) : lead.notes ? (
                            <span className="text-xs text-slate-500 truncate max-w-[160px] block">{lead.notes}</span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs font-semibold gap-1 ${sm.color}`}>
                            <StatusIcon status={lead.status} />
                            {sm.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {date}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {actions.map((a) => (
                              <Button
                                key={a}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2"
                                onClick={() => changeStatus(lead, a)}
                              >
                                {STATUS_META[a]?.label ?? a}
                              </Button>
                            ))}
                            <a href={`tel:${lead.phone}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-700 border-green-200 hover:bg-green-50">
                                <Phone className="w-3 h-3 mr-1" /> Call
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
    </AdminLayout>
  );
}
