import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plane, Bus, Building2, Map, IndianRupee, Users,
  TrendingUp, ArrowLeft, BarChart2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

function mergeAllBookings(): any[] {
  try {
    const lsRaw = localStorage.getItem("travel_bookings");
    const ssRaw = localStorage.getItem("msw_mock_bookings");
    const lsAll: any[] = lsRaw ? JSON.parse(lsRaw) : [];
    const ssAll: any[] = ssRaw ? JSON.parse(ssRaw) : [];
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const b of [...ssAll, ...lsAll]) {
      const key = b.bookingId || b.id?.toString() || "";
      if (!seen.has(key)) { seen.add(key); merged.push(b); }
    }
    return merged;
  } catch { return []; }
}

function loadAgents(): any[] {
  try {
    const raw = localStorage.getItem("users");
    const users: any[] = raw ? JSON.parse(raw) : [];
    return users.filter((u) => u.role === "agent");
  } catch { return []; }
}

const getAmount        = (b: any) => b.amount ?? b.details?.amount ?? b.totalPrice ?? 0;
const getMarkupProfit  = (b: any) => b.details?.markupAmount ?? b.markupAmount ?? 0;
const getFeeProfit     = (b: any) => b.details?.convenienceFee ?? b.convenienceFee ?? 0;
const getFee           = (b: any) => getMarkupProfit(b) + getFeeProfit(b);
const getAgentComm     = (b: any) => Number(b.commissionEarned) || Number(b.details?.commissionEarned) || 0;
const getBookingDate   = (b: any) => b.details?.createdAt?.slice(0, 10) ?? b.createdAt?.slice(0, 10) ?? b.travelDate ?? "";

export default function AdminProfit() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();

  const todayStr      = new Date().toISOString().slice(0, 10);
  const thisMonthStart = (() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); })();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const allBookings = useMemo(() => mergeAllBookings(), []);
  const agents      = useMemo(() => loadAgents(), []);

  const filtered = useMemo(() => allBookings.filter((b) => {
    const bDate   = getBookingDate(b);
    const matchDf = !dateFrom || bDate >= dateFrom;
    const matchDt = !dateTo   || bDate <= dateTo;
    return matchDf && matchDt;
  }), [allBookings, dateFrom, dateTo]);

  const revenue    = filtered.reduce((s, b) => s + getAmount(b), 0);
  const markup     = filtered.reduce((s, b) => s + getMarkupProfit(b), 0);
  const fee        = filtered.reduce((s, b) => s + getFeeProfit(b), 0);
  const profit     = filtered.reduce((s, b) => s + getFee(b), 0);
  const commission = filtered.reduce((s, b) => s + getAgentComm(b), 0);
  const netProfit  = profit - commission;
  const margin     = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : "0.0";

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Access denied.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6 px-6 shadow-lg">
          <div className="container mx-auto flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profit & Commission Report</h1>
              <p className="text-primary-foreground/80 text-sm">Service-wise breakdown and agent commissions</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 space-y-6">

          {/* Period filter */}
          <Card>
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Filter by period:</span>
              <Button size="sm" variant={dateFrom === todayStr && dateTo === todayStr ? "default" : "outline"}
                onClick={() => { setDateFrom(todayStr); setDateTo(todayStr); }}>
                Today
              </Button>
              <Button size="sm" variant={dateFrom === thisMonthStart && !dateTo ? "default" : "outline"}
                onClick={() => { setDateFrom(thisMonthStart); setDateTo(""); }}>
                This Month
              </Button>
              <Button size="sm" variant={!dateFrom && !dateTo ? "default" : "outline"}
                onClick={() => { setDateFrom(""); setDateTo(""); }}>
                All Time
              </Button>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Label className="text-xs whitespace-nowrap text-muted-foreground">Custom:</Label>
                <Input type="date" className="h-8 text-xs flex-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" className="h-8 text-xs flex-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              {(dateFrom || dateTo) && (
                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground"
                  onClick={() => { setDateFrom(""); setDateTo(""); }}>
                  Clear
                </Button>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-orange-600 uppercase mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-orange-700">₹{revenue.toLocaleString("en-IN")}</p>
                <p className="text-xs text-orange-500 mt-1">Gross collected</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Markup Earnings</p>
                <p className="text-xl font-bold text-amber-700">₹{markup.toLocaleString("en-IN")}</p>
                <p className="text-xs text-amber-500 mt-1">Hidden margin</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Conv. Fee Earnings</p>
                <p className="text-xl font-bold text-blue-700">₹{fee.toLocaleString("en-IN")}</p>
                <p className="text-xs text-blue-500 mt-1">Visible checkout fee</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-red-600 uppercase mb-1">Agent Commission</p>
                <p className="text-xl font-bold text-red-700">₹{commission.toLocaleString("en-IN")}</p>
                <p className="text-xs text-red-500 mt-1">Paid out to agents</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-emerald-300 bg-emerald-50 sm:col-span-1 col-span-2">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Net Profit</p>
                <p className="text-2xl font-extrabold text-emerald-800">₹{netProfit.toLocaleString("en-IN")}</p>
                <p className="text-xs text-emerald-600 mt-1">Margin: {margin}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Service-wise breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Service-wise Profit & Commission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Service</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Bookings</th>
                      <th className="text-right px-4 py-3 font-semibold text-orange-600">Revenue (₹)</th>
                      <th className="text-right px-4 py-3 font-semibold text-emerald-700">Profit (₹)</th>
                      <th className="text-right px-4 py-3 font-semibold text-red-600">Commission (₹)</th>
                      <th className="text-right px-4 py-3 font-semibold text-green-800">Net Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {([
                      { key: "flight",  label: "Flights",  Icon: Plane },
                      { key: "hotel",   label: "Hotels",   Icon: Building2 },
                      { key: "bus",     label: "Buses",    Icon: Bus },
                      { key: "package", label: "Holidays", Icon: Map },
                    ] as const).map(({ key, label, Icon }) => {
                      const svcBs   = filtered.filter((b) => (b.bookingType || b.type) === key);
                      const svcRev  = svcBs.reduce((s, b) => s + getAmount(b), 0);
                      const svcPft  = svcBs.reduce((s, b) => s + getFee(b), 0);
                      const svcComm = svcBs.reduce((s, b) => s + getAgentComm(b), 0);
                      const svcNet  = svcPft - svcComm;
                      return (
                        <tr key={key} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{svcBs.length}</td>
                          <td className="px-4 py-3 text-right font-semibold text-orange-600">
                            {svcRev > 0 ? `₹${svcRev.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            {svcPft > 0 ? `₹${svcPft.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600">
                            {svcComm > 0 ? `₹${svcComm.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-green-800">
                            ₹{svcNet.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2">
                    <tr>
                      <td className="px-4 py-3 font-bold">Total</td>
                      <td className="px-4 py-3 text-right font-bold">{filtered.length}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-700">₹{revenue.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">₹{profit.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-700">₹{commission.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-green-800 text-base">₹{netProfit.toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Agent commission breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Agent Commission Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No agents registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Agent</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Code</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Bookings</th>
                        <th className="text-right px-4 py-3 font-semibold text-orange-600">Revenue</th>
                        <th className="text-right px-4 py-3 font-semibold text-red-600">Commission</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agents.map((agent) => {
                        const agentBs   = filtered.filter((b) =>
                          b.agentEmail === agent.email ||
                          b.details?.agentEmail === agent.email ||
                          b.passengerEmail === agent.email
                        );
                        const agentRev  = agentBs.reduce((s, b) => s + getAmount(b), 0);
                        const agentComm = agentBs.reduce((s, b) => s + getAgentComm(b), 0);
                        return (
                          <tr key={agent.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-sm">{agent.agencyName || agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.email}</p>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-blue-700">{agent.agentCode || "—"}</td>
                            <td className="px-4 py-3 text-right font-semibold">{agentBs.length}</td>
                            <td className="px-4 py-3 text-right font-semibold text-orange-600">
                              {agentRev > 0 ? `₹${agentRev.toLocaleString("en-IN")}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">
                              {agentComm > 0 ? `₹${agentComm.toLocaleString("en-IN")}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                agent.isApproved
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {agent.isApproved ? "Active" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/30 border-t-2">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 font-bold">All Agents Total</td>
                        <td className="px-4 py-3 text-right font-bold">
                          {agents.reduce((s, a) =>
                            s + filtered.filter((b) =>
                              b.agentEmail === a.email || b.details?.agentEmail === a.email || b.passengerEmail === a.email
                            ).length, 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-orange-700">
                          ₹{agents.reduce((s, a) =>
                            s + filtered
                              .filter((b) => b.agentEmail === a.email || b.details?.agentEmail === a.email || b.passengerEmail === a.email)
                              .reduce((ss, b) => ss + getAmount(b), 0), 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-red-700">
                          ₹{commission.toLocaleString("en-IN")}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
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
