import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  Phone, MessageCircle, RefreshCw, Search,
  InboxIcon, CheckCircle2, UserCheck, Clock,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { fetchEnquiries, type CrmEnquiry } from "@/lib/crm";

const STATUS_META: Record<string, { label: string; color: string }> = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  resolved:  { label: "Resolved",  color: "bg-green-100 text-green-800" },
};

const SOURCE_META: Record<string, { label: string; color: string }> = {
  guest:    { label: "Guest",    color: "bg-slate-100 text-slate-700" },
  customer: { label: "Customer", color: "bg-purple-100 text-purple-700" },
  agent:    { label: "Agent",    color: "bg-orange-100 text-orange-700" },
};

const BASE = () => (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");

export default function AdminEnquiries() {
  const [, setLocation] = useLocation();
  const { isAdmin }     = useAuth();
  const { toast }       = useToast();

  const [enquiries,    setEnquiries]    = useState<CrmEnquiry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search,       setSearch]       = useState("");

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    const data = await fetchEnquiries();
    setEnquiries(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  const filtered = enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.name.toLowerCase().includes(q) &&
        !e.phone.includes(q) &&
        !e.destination.toLowerCase().includes(q) &&
        !e.packageName.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const stats = {
    total:     enquiries.length,
    new:       enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    resolved:  enquiries.filter((e) => e.status === "resolved").length,
  };

  async function updateStatus(enquiryId: string, status: string) {
    try {
      const res = await fetch(`${BASE()}/api/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEnquiries((prev) => prev.map((e) =>
        e.enquiryId === enquiryId ? { ...e, status } : e
      ));
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Error", description: "Could not update status", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Holiday Enquiries</h1>
            <p className="text-xs text-muted-foreground">Direct enquiries submitted by guests and customers</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadEnquiries} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Enquiries", value: stats.total,     icon: InboxIcon,    color: "text-slate-700" },
            { label: "New",             value: stats.new,       icon: Clock,        color: "text-blue-600" },
            { label: "Contacted",       value: stats.contacted, icon: UserCheck,    color: "text-yellow-600" },
            { label: "Resolved",        value: stats.resolved,  icon: CheckCircle2, color: "text-green-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color} shrink-0`} />
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, package or destination…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              {loading ? "Loading…" : `${filtered.length} enquir${filtered.length === 1 ? "y" : "ies"}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading enquiries…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <InboxIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No enquiries found</p>
                <p className="text-sm">Enquiries from guests and customers will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      {["Enquiry ID", "Customer", "Package", "People", "Travel Date", "Source", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((e) => {
                      const sm = STATUS_META[e.status] ?? { label: e.status, color: "bg-slate-100 text-slate-700" };
                      const src = SOURCE_META[e.source] ?? { label: e.source, color: "bg-slate-100 text-slate-700" };
                      return (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.enquiryId}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{e.name}</div>
                            <div className="text-xs text-muted-foreground">{e.phone}</div>
                            {e.agentName && (
                              <div className="text-xs text-orange-600 mt-0.5">Agent: {e.agentName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{e.packageName}</div>
                            <div className="text-xs text-muted-foreground">{e.destination}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">{e.people ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.travelDate || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs font-semibold ${src.color}`}>{src.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={e.status}
                              onValueChange={(v) => updateStatus(e.enquiryId, v)}
                            >
                              <SelectTrigger className={`h-7 text-xs w-28 font-semibold border-0 ${sm.color}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <a
                                href={`tel:${e.phone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                              >
                                <Phone className="w-3 h-3" /> Call
                              </a>
                              <a
                                href={`https://wa.me/91${e.phone.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(e.name)}, regarding your enquiry for ${encodeURIComponent(e.packageName)}…`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
}
