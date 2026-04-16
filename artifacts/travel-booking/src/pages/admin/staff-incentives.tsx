import { useState, useMemo, useEffect } from "react";
import type { JSX } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users, IndianRupee, TrendingUp, Award, ChevronDown, ChevronRight,
  Plane, Bus, Building2, Settings2, Save, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllStaffBookings, getIncentiveConfig, saveIncentiveConfig,
  recalculateAllIncentives, calculateIncentive,
  type StaffBookingRecord, type IncentiveConfig,
} from "@/lib/staff-data";
import { useToast } from "@/hooks/use-toast";

function loadStaffUsers(): { id: string; name: string; email: string }[] {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem("users") ?? "[]");
    return raw.filter((u) => u.role === "staff").map((u) => ({ id: u.id, name: u.name, email: u.email }));
  } catch { return []; }
}

const TYPE_ICON: Record<string, JSX.Element> = {
  flight: <Plane    className="w-3.5 h-3.5" />,
  bus:    <Bus      className="w-3.5 h-3.5" />,
  hotel:  <Building2 className="w-3.5 h-3.5" />,
};

const TYPE_COLOR: Record<string, string> = {
  flight: "bg-blue-50 text-blue-700 border-blue-200",
  bus:    "bg-green-50 text-green-700 border-green-200",
  hotel:  "bg-purple-50 text-purple-700 border-purple-200",
};

function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

interface StaffRow {
  staffId: string;
  staffName: string;
  bookings: StaffBookingRecord[];
  totalAmount: number;
  totalProfit: number;
  totalIncentive: number;
}

export default function AdminStaffIncentives() {
  const { toast } = useToast();

  const [config,    setConfig]    = useState<IncentiveConfig>(getIncentiveConfig);
  const [draftFixed, setDraftFixed] = useState(String(config.fixedAmount));
  const [draftPct,   setDraftPct]   = useState(String(config.profitPercent));
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [bookings,  setBookings]  = useState<StaffBookingRecord[]>([]);
  const [staffUsers, setStaffUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    setBookings(getAllStaffBookings());
    setStaffUsers(loadStaffUsers());
  }, []);

  function saveConfig() {
    const fixed = Number(draftFixed);
    const pct   = Number(draftPct);
    if (isNaN(fixed) || fixed < 0 || isNaN(pct) || pct < 0 || pct > 100) {
      toast({ variant: "destructive", title: "Invalid values", description: "Fixed amount must be ≥ 0. Percentage must be 0–100." });
      return;
    }
    const newConfig: IncentiveConfig = { fixedAmount: fixed, profitPercent: pct };
    saveIncentiveConfig(newConfig);
    setConfig(newConfig);
    recalculateAllIncentives();
    setBookings(getAllStaffBookings());
    toast({ title: "Config saved", description: "All incentives recalculated with new rules." });
  }

  const staffRows = useMemo<StaffRow[]>(() => {
    const map = new Map<string, StaffRow>();

    for (const b of bookings) {
      if (!map.has(b.staffId)) {
        map.set(b.staffId, {
          staffId:       b.staffId,
          staffName:     b.staffName,
          bookings:      [],
          totalAmount:   0,
          totalProfit:   0,
          totalIncentive: 0,
        });
      }
      const row = map.get(b.staffId)!;
      row.bookings.push(b);
      row.totalAmount    += b.amount;
      row.totalProfit    += b.profit ?? 0;
      row.totalIncentive += b.incentive;
    }

    for (const staffUser of staffUsers) {
      if (!map.has(staffUser.id)) {
        map.set(staffUser.id, {
          staffId:       staffUser.id,
          staffName:     staffUser.name,
          bookings:      [],
          totalAmount:   0,
          totalProfit:   0,
          totalIncentive: 0,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalIncentive - a.totalIncentive);
  }, [bookings, staffUsers]);

  const totals = useMemo(() => ({
    bookings:  bookings.length,
    profit:    bookings.reduce((s, b) => s + (b.profit ?? 0), 0),
    incentive: bookings.reduce((s, b) => s + b.incentive, 0),
  }), [bookings]);

  function toggleExpand(staffId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(staffId) ? next.delete(staffId) : next.add(staffId);
      return next;
    });
  }

  const previewIncentive = calculateIncentive(1000, { fixedAmount: Number(draftFixed) || 0, profitPercent: Number(draftPct) || 0 });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Staff Incentives</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure rules and track incentives earned per booking</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto" onClick={() => { setBookings(getAllStaffBookings()); setStaffUsers(loadStaffUsers()); }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Staff</span>
              </div>
              <p className="text-2xl font-extrabold text-blue-900">{staffRows.length}</p>
              <p className="text-xs text-blue-600 mt-0.5">Total staff members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bookings</span>
              </div>
              <p className="text-2xl font-extrabold text-green-900">{totals.bookings}</p>
              <p className="text-xs text-green-600 mt-0.5">Staff-assisted bookings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Profit</span>
              </div>
              <p className="text-2xl font-extrabold text-purple-900">{fmt(totals.profit)}</p>
              <p className="text-xs text-purple-600 mt-0.5">Total profit generated</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Incentives</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-900">{fmt(totals.incentive)}</p>
              <p className="text-xs text-amber-600 mt-0.5">Total incentives earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Config card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-purple-600" />
              Incentive Calculation Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fixed-amount" className="text-sm font-medium">
                  Fixed Amount per Booking (₹)
                </Label>
                <Input
                  id="fixed-amount"
                  type="number"
                  min={0}
                  value={draftFixed}
                  onChange={(e) => setDraftFixed(e.target.value)}
                  placeholder="200"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">Flat amount credited for every completed booking</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profit-pct" className="text-sm font-medium">
                  Percentage of Profit (%)
                </Label>
                <Input
                  id="profit-pct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={draftPct}
                  onChange={(e) => setDraftPct(e.target.value)}
                  placeholder="5"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">Additional % of the booking profit (markup + fee)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t">
              <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-sm">
                <span className="text-muted-foreground">Preview — on ₹1,000 profit: </span>
                <span className="font-bold text-slate-800">
                  {fmt(Number(draftFixed) || 0)} fixed + {fmt(Math.round(1000 * (Number(draftPct) || 0) / 100))} ({draftPct || 0}%)
                  {" = "}<span className="text-green-700">{fmt(previewIncentive)}</span>
                </span>
              </div>
              <Button onClick={saveConfig} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shrink-0">
                <Save className="w-4 h-4" /> Save &amp; Recalculate
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <strong>Current rule:</strong> ₹{config.fixedAmount} fixed + {config.profitPercent}% of profit per booking.
              Saving will instantly recalculate all existing incentive records.
            </div>
          </CardContent>
        </Card>

        {/* Staff performance table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Staff Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {staffRows.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Award className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-500">No staff booking records yet</p>
                <p className="text-sm mt-1">Records appear here automatically when staff complete bookings</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_110px_40px] gap-4 px-5 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Staff Member</span>
                  <span className="text-right">Bookings</span>
                  <span className="text-right">Revenue</span>
                  <span className="text-right">Profit</span>
                  <span className="text-right">Incentive</span>
                  <span />
                </div>

                {staffRows.map((row) => {
                  const isOpen = expanded.has(row.staffId);
                  return (
                    <div key={row.staffId}>
                      {/* Row */}
                      <button
                        onClick={() => toggleExpand(row.staffId)}
                        className="w-full flex flex-col sm:grid sm:grid-cols-[1fr_80px_100px_100px_110px_40px] gap-2 sm:gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        {/* Name / mobile layout */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-purple-700">
                              {row.staffName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{row.staffName}</p>
                            <p className="text-xs text-muted-foreground">{row.bookings.length} bookings</p>
                          </div>
                          {/* Mobile inline stats */}
                          <div className="ml-auto sm:hidden text-right">
                            <p className="text-sm font-bold text-green-700">{fmt(row.totalIncentive)}</p>
                            <p className="text-xs text-muted-foreground">incentive</p>
                          </div>
                        </div>

                        <div className="hidden sm:block text-right font-semibold text-slate-700 self-center">
                          {row.bookings.length}
                        </div>
                        <div className="hidden sm:block text-right text-slate-600 text-sm self-center">
                          {fmt(row.totalAmount)}
                        </div>
                        <div className="hidden sm:block text-right text-blue-700 text-sm font-medium self-center">
                          {fmt(row.totalProfit)}
                        </div>
                        <div className="hidden sm:block text-right self-center">
                          <span className="font-bold text-green-700">{fmt(row.totalIncentive)}</span>
                        </div>
                        <div className="hidden sm:flex items-center justify-center text-slate-400 self-center">
                          {isOpen
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expandable booking rows */}
                      {isOpen && (
                        <div className="bg-slate-50 border-t">
                          {row.bookings.length === 0 ? (
                            <p className="px-6 py-4 text-sm text-muted-foreground">No booking records</p>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {/* Sub-header */}
                              <div className="hidden sm:grid grid-cols-[40px_1fr_90px_90px_90px_110px] gap-3 px-6 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                <span>Type</span>
                                <span>Booking Ref · Customer</span>
                                <span className="text-right">Amount</span>
                                <span className="text-right">Profit</span>
                                <span className="text-right">Fixed</span>
                                <span className="text-right">Incentive</span>
                              </div>

                              {row.bookings
                                .slice()
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((bk) => {
                                  const fixedPart = config.fixedAmount;
                                  const pctPart   = Math.round(((bk.profit ?? 0) * config.profitPercent) / 100);
                                  return (
                                    <div
                                      key={bk.id}
                                      className="px-6 py-3 flex flex-col sm:grid sm:grid-cols-[40px_1fr_90px_90px_90px_110px] gap-2 sm:gap-3 sm:items-center"
                                    >
                                      <div className="sm:flex sm:justify-center">
                                        <span className={cn(
                                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                                          TYPE_COLOR[bk.type] ?? "bg-slate-50 text-slate-600 border-slate-200"
                                        )}>
                                          {TYPE_ICON[bk.type]}
                                          <span className="hidden sm:inline">{bk.type}</span>
                                        </span>
                                      </div>

                                      <div>
                                        <p className="font-mono text-xs font-semibold text-slate-700">{bk.bookingRef}</p>
                                        <p className="text-xs text-muted-foreground">{bk.customerName} · {fmtDate(bk.date)}</p>
                                      </div>

                                      <div className="flex sm:block items-center justify-between">
                                        <span className="text-xs text-muted-foreground sm:hidden">Amount</span>
                                        <span className="text-sm text-right text-slate-600">{fmt(bk.amount)}</span>
                                      </div>

                                      <div className="flex sm:block items-center justify-between">
                                        <span className="text-xs text-muted-foreground sm:hidden">Profit</span>
                                        <span className="text-sm text-right text-blue-600 font-medium">{fmt(bk.profit ?? 0)}</span>
                                      </div>

                                      <div className="flex sm:block items-center justify-between">
                                        <span className="text-xs text-muted-foreground sm:hidden">Fixed</span>
                                        <span className="text-sm text-right text-slate-500">
                                          {fmt(fixedPart)}
                                          {pctPart > 0 && <span className="text-[11px] text-slate-400"> + {fmt(pctPart)}</span>}
                                        </span>
                                      </div>

                                      <div className="flex sm:block items-center justify-between">
                                        <span className="text-xs text-muted-foreground sm:hidden">Incentive</span>
                                        <span className="text-sm font-bold text-right text-green-700">
                                          {fmt(bk.incentive)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                              })}

                              {/* Staff total row */}
                              <div className="px-6 py-3 flex flex-col sm:grid sm:grid-cols-[40px_1fr_90px_90px_90px_110px] gap-2 sm:gap-3 bg-white border-t border-slate-200">
                                <div />
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide self-center">Total</div>
                                <div className="text-right text-sm font-semibold text-slate-700">{fmt(row.totalAmount)}</div>
                                <div className="text-right text-sm font-semibold text-blue-700">{fmt(row.totalProfit)}</div>
                                <div />
                                <div className="text-right text-base font-extrabold text-green-700">{fmt(row.totalIncentive)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
