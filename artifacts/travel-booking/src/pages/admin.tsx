import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListBookings } from "@workspace/api-client-react";
import { Plane, Bus, Building2, Map, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const { data: bookings, isLoading } = useListBookings();

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

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all bookings and revenue</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Total Bookings</p>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-extrabold">{stats.total}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <p className="text-3xl font-extrabold">${stats.revenue.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Confirmed</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-extrabold text-green-600">{stats.confirmed}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Cancelled</p>
                <Users className="w-4 h-4 text-destructive" />
              </div>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-extrabold text-destructive">{stats.cancelled}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Flight Bookings", count: stats.flights, icon: <Plane className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
            { label: "Bus Bookings", count: stats.buses, icon: <Bus className="w-5 h-5" />, color: "bg-orange-50 text-orange-600" },
            { label: "Hotel Bookings", count: stats.hotels, icon: <Building2 className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
            { label: "Package Bookings", count: stats.packages, icon: <Map className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
          ].map(({ label, count, icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>{icon}</div>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                {isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : (
                  <p className="text-2xl font-bold mt-1">{count}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
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
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              WND-{String(booking.id).padStart(6, "0")}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2 capitalize">
                              <span className="text-primary">{bookingTypeIcon(booking.bookingType)}</span>
                              {booking.bookingType}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium">{booking.passengerName}</p>
                              <p className="text-xs text-muted-foreground">{booking.passengerEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{booking.travelDate}</td>
                          <td className="py-3 pr-4 font-semibold">${booking.totalPrice.toLocaleString()}</td>
                          <td className="py-3">
                            <Badge variant={statusVariant(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
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
      </div>
    </Layout>
  );
}
