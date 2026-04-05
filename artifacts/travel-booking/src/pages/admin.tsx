import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListBookings } from "@workspace/api-client-react";
import {
  Plane, Bus, Building2, Map, DollarSign, TrendingUp,
  Calendar, LayoutDashboard, Tag, Settings, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Section = "dashboard" | "flights" | "hotels" | "bus" | "holidays" | "coupons";

type LocalBooking = {
  name: string;
  phone: string;
  email: string;
  finalPrice: number;
  bookedAt: string;
};

type Coupon = {
  code: string;
  discount: number;
};

export default function Admin() {
  const { data: bookings, isLoading } = useListBookings();
  const { toast } = useToast();

  const [section, setSection] = useState<Section>("dashboard");
  const [markup, setMarkup] = useState<string>("");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [localBookings, setLocalBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    const savedMarkup = localStorage.getItem("markup") ?? "";
    setMarkup(savedMarkup);
    const savedCoupons: Coupon[] = JSON.parse(localStorage.getItem("coupons") ?? "[]");
    setCoupons(savedCoupons);
    const savedBookings: LocalBooking[] = JSON.parse(localStorage.getItem("bookings") ?? "[]");
    setLocalBookings(savedBookings);
  }, []);

  function saveMarkup() {
    const num = parseFloat(markup);
    if (isNaN(num) || num < 0) {
      toast({ variant: "destructive", title: "Invalid markup", description: "Enter a valid positive number." });
      return;
    }
    localStorage.setItem("markup", markup);
    toast({ title: "Markup saved", description: `Markup set to $${markup}` });
  }

  function addCoupon() {
    const code = newCouponCode.trim().toUpperCase();
    const discount = parseFloat(newCouponDiscount);
    if (!code) {
      toast({ variant: "destructive", title: "Invalid coupon", description: "Enter a coupon code." });
      return;
    }
    if (isNaN(discount) || discount <= 0) {
      toast({ variant: "destructive", title: "Invalid discount", description: "Enter a valid discount amount." });
      return;
    }
    if (coupons.find((c) => c.code === code)) {
      toast({ variant: "destructive", title: "Duplicate coupon", description: "This coupon code already exists." });
      return;
    }
    const updated = [...coupons, { code, discount }];
    setCoupons(updated);
    localStorage.setItem("coupons", JSON.stringify(updated));
    setNewCouponCode("");
    setNewCouponDiscount("");
    toast({ title: "Coupon added", description: `${code} — $${discount} off` });
  }

  function deleteCoupon(code: string) {
    const updated = coupons.filter((c) => c.code !== code);
    setCoupons(updated);
    localStorage.setItem("coupons", JSON.stringify(updated));
    toast({ title: "Coupon removed" });
  }

  const stats = {
    total: bookings?.length ?? 0,
    flights: bookings?.filter((b) => b.bookingType === "flight").length ?? 0,
    buses: bookings?.filter((b) => b.bookingType === "bus").length ?? 0,
    hotels: bookings?.filter((b) => b.bookingType === "hotel").length ?? 0,
    packages: bookings?.filter((b) => b.bookingType === "package").length ?? 0,
    revenue: bookings?.reduce((sum, b) => sum + b.totalPrice, 0) ?? 0,
    confirmed: bookings?.filter((b) => b.status === "confirmed").length ?? 0,
    cancelled: bookings?.filter((b) => b.status === "cancelled").length ?? 0,
  };

  const bookingTypeIcon = (type: string) => {
    if (type === "flight") return <Plane className="w-4 h-4" />;
    if (type === "bus") return <Bus className="w-4 h-4" />;
    if (type === "hotel") return <Building2 className="w-4 h-4" />;
    return <Map className="w-4 h-4" />;
  };

  const statusVariant = (status: string): "default" | "destructive" | "secondary" => {
    if (status === "confirmed") return "default";
    if (status === "cancelled") return "destructive";
    return "secondary";
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "flights", label: "Flights", icon: <Plane className="w-4 h-4" /> },
    { id: "hotels", label: "Hotels", icon: <Building2 className="w-4 h-4" /> },
    { id: "bus", label: "Bus", icon: <Bus className="w-4 h-4" /> },
    { id: "holidays", label: "Holidays", icon: <Map className="w-4 h-4" /> },
    { id: "coupons", label: "Coupons", icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 bg-card border-r flex flex-col">
          <div className="p-5 border-b">
            <p className="font-extrabold text-primary text-lg">WanderWay</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {icon}
                {label}
                {section === id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Settings</span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">Markup</p>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="$0"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="h-7 text-xs"
                />
                <Button size="sm" className="h-7 text-xs px-2" onClick={saveMarkup}>Save</Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-6 border-b bg-card">
            <h1 className="text-2xl font-extrabold capitalize">{section}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {section === "dashboard" ? "Overview of all bookings and revenue" :
               section === "coupons" ? "Manage discount coupon codes" :
               `Manage ${section} bookings`}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {section === "dashboard" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Total Bookings</p>
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{stats.total}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-extrabold">${stats.revenue.toLocaleString()}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Confirmed</p>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold text-green-600">{stats.confirmed}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Cancelled</p>
                        <Calendar className="w-4 h-4 text-destructive" />
                      </div>
                      {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold text-destructive">{stats.cancelled}</p>}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Flights", count: stats.flights, icon: <Plane className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
                    { label: "Buses", count: stats.buses, icon: <Bus className="w-5 h-5" />, color: "bg-orange-50 text-orange-600" },
                    { label: "Hotels", count: stats.hotels, icon: <Building2 className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
                    { label: "Packages", count: stats.packages, icon: <Map className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
                  ].map(({ label, count, icon, color }) => (
                    <Card key={label}>
                      <CardContent className="pt-5">
                        <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>{icon}</div>
                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                        {isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="text-2xl font-bold mt-1">{count}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="text-left py-3 pr-4 font-semibold">Ref ID</th>
                              <th className="text-left py-3 pr-4 font-semibold">Type</th>
                              <th className="text-left py-3 pr-4 font-semibold">Passenger</th>
                              <th className="text-left py-3 pr-4 font-semibold">Travel Date</th>
                              <th className="text-left py-3 pr-4 font-semibold">Price</th>
                              <th className="text-left py-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...bookings]
                              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                              .map((booking) => (
                                <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <td className="py-3 pr-4">
                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">WND-{String(booking.id).padStart(6, "0")}</span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2 capitalize">
                                      <span className="text-primary">{bookingTypeIcon(booking.bookingType)}</span>
                                      {booking.bookingType}
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <p className="font-medium">{booking.passengerName}</p>
                                    <p className="text-xs text-muted-foreground">{booking.passengerEmail}</p>
                                  </td>
                                  <td className="py-3 pr-4 text-muted-foreground">{booking.travelDate}</td>
                                  <td className="py-3 pr-4 font-semibold">${booking.totalPrice.toLocaleString()}</td>
                                  <td className="py-3">
                                    <Badge variant={statusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
                    )}
                  </CardContent>
                </Card>

                {localBookings.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Razorpay Payments</CardTitle></CardHeader>
                    <CardContent>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-3 pr-4 font-semibold">Name</th>
                            <th className="text-left py-3 pr-4 font-semibold">Email</th>
                            <th className="text-left py-3 pr-4 font-semibold">Phone</th>
                            <th className="text-left py-3 pr-4 font-semibold">Amount Paid</th>
                            <th className="text-left py-3 font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...localBookings].reverse().map((b, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-3 pr-4 font-medium">{b.name}</td>
                              <td className="py-3 pr-4 text-muted-foreground">{b.email}</td>
                              <td className="py-3 pr-4 text-muted-foreground">{b.phone}</td>
                              <td className="py-3 pr-4 font-semibold text-primary">₹{b.finalPrice.toLocaleString()}</td>
                              <td className="py-3 text-muted-foreground text-xs">{new Date(b.bookedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {(section === "flights" || section === "hotels" || section === "bus" || section === "holidays") && (
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{section} Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : (() => {
                    const typeMap: Record<string, string> = { flights: "flight", hotels: "hotel", bus: "bus", holidays: "package" };
                    const filtered = bookings?.filter((b) => b.bookingType === typeMap[section]) ?? [];
                    return filtered.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-3 pr-4 font-semibold">Ref ID</th>
                            <th className="text-left py-3 pr-4 font-semibold">Passenger</th>
                            <th className="text-left py-3 pr-4 font-semibold">Travel Date</th>
                            <th className="text-left py-3 pr-4 font-semibold">Price</th>
                            <th className="text-left py-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((booking) => (
                            <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-3 pr-4">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">WND-{String(booking.id).padStart(6, "0")}</span>
                              </td>
                              <td className="py-3 pr-4">
                                <p className="font-medium">{booking.passengerName}</p>
                                <p className="text-xs text-muted-foreground">{booking.passengerEmail}</p>
                              </td>
                              <td className="py-3 pr-4 text-muted-foreground">{booking.travelDate}</td>
                              <td className="py-3 pr-4 font-semibold">${booking.totalPrice.toLocaleString()}</td>
                              <td className="py-3">
                                <Badge variant={statusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No {section} bookings yet.</p>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {section === "coupons" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Add Coupon Code</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Coupon code (e.g. SAVE100)"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        className="font-mono uppercase"
                      />
                      <Input
                        type="number"
                        placeholder="Discount amount ($)"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="sm:max-w-[180px]"
                      />
                      <Button onClick={addCoupon} className="shrink-0">Add Coupon</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Active Coupons</CardTitle></CardHeader>
                  <CardContent>
                    {coupons.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">No coupons yet. Add one above.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-3 pr-4 font-semibold">Code</th>
                            <th className="text-left py-3 pr-4 font-semibold">Discount</th>
                            <th className="text-left py-3 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((coupon) => (
                            <tr key={coupon.code} className="border-b last:border-0">
                              <td className="py-3 pr-4">
                                <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded text-xs">{coupon.code}</span>
                              </td>
                              <td className="py-3 pr-4 font-semibold text-green-600">-${coupon.discount}</td>
                              <td className="py-3">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteCoupon(coupon.code)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
