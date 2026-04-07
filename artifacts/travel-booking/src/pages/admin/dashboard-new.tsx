import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Building2, Bus, Map, FileText, Activity, User, Menu } from "lucide-react";
import { useAdminData } from "@/lib/use-admin-data";

export default function AdminDashboard() {
  const { data } = useAdminData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
          <User className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-lg">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Balance: <span className="font-bold">480</span></span>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">PV</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics Cards Row */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {/* Flight Bookings */}
          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Plane className="w-8 h-8 text-pink-600" />
                <span className="text-3xl font-bold text-pink-700">{data.stats.flightBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-pink-800">Flight Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-pink-700">{data.stats.flightBookings.pending}</span>
                  <span className="text-pink-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.flightBookings.cancelled}</span>
                  <span className="text-pink-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Bookings */}
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-green-700">{data.stats.hotelBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-green-800">Hotel Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700">{data.stats.hotelBookings.pending}</span>
                  <span className="text-green-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.hotelBookings.cancelled}</span>
                  <span className="text-green-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holiday Bookings */}
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Map className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-700">{data.stats.holidayBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-blue-800">Holiday Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">{data.stats.holidayBookings.pending}</span>
                  <span className="text-blue-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.holidayBookings.cancelled}</span>
                  <span className="text-blue-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bus Bookings */}
          <Card className="bg-gradient-to-br from-cyan-100 to-cyan-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Bus className="w-8 h-8 text-cyan-600" />
                <span className="text-3xl font-bold text-cyan-700">{data.stats.busBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-cyan-800">Bus Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-cyan-700">{data.stats.busBookings.pending}</span>
                  <span className="text-cyan-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.busBookings.cancelled}</span>
                  <span className="text-cyan-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visa Bookings */}
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-700">{data.stats.visaBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-purple-800">Visa Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-700">{data.stats.visaBookings.pending}</span>
                  <span className="text-purple-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.visaBookings.cancelled}</span>
                  <span className="text-purple-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Bookings */}
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-gray-600" />
                <span className="text-3xl font-bold text-gray-700">{data.stats.activitiesBookings.total}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">Activities Bookings</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700">{data.stats.activitiesBookings.pending}</span>
                  <span className="text-gray-600">Umrah Bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">{data.stats.activitiesBookings.cancelled}</span>
                  <span className="text-gray-600">Hajj Bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Ledger */}
        <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
          <CardContent className="p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-90">₹ {data.stats.accountBalance}</p>
              <p className="text-xl font-bold">View Account Ledger</p>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* ALL BOOKINGS */}
          <Card>
            <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">≡ ALL BOOKINGS</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-indigo-600">
                View More
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">All Bookings</th>
                    <th className="text-center p-3 font-medium">Pending</th>
                    <th className="text-center p-3 font-medium">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.allBookings.map((booking, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-medium">{booking.type}</td>
                      <td className="p-3 text-center">{booking.pending}</td>
                      <td className="p-3 text-center">{booking.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* PENDING PAYMENTS */}
          <Card>
            <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">≡ PENDING PAYMENTS</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-indigo-600">
                View More
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Ref No</th>
                    <th className="text-left p-3 font-medium">Mode</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-center p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.pendingPayments.map((payment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{payment.company}</td>
                      <td className="p-3">{payment.refNo}</td>
                      <td className="p-3">{payment.mode}</td>
                      <td className="p-3 text-right font-semibold">{payment.amount}</td>
                      <td className="p-3 text-center text-gray-600">{payment.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AGENT ACTIVATION REQUEST */}
          <Card>
            <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">≡ AGENT ACTIVATION REQUEST</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-indigo-600">
                View More
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Region</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.agentRequests.map((request, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{request.company}</td>
                      <td className="p-3">{request.region}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-600">{request.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* BOOKING REFUNDS */}
          <Card>
            <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">≡ BOOKING REFUNDS</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-indigo-600">
                View More
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-center p-3 font-medium">All Refunds</th>
                    <th className="text-center p-3 font-medium">Opened Refund</th>
                    <th className="text-center p-3 font-medium">Closed Refund</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.refunds.map((refund, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{refund.category}</td>
                      <td className="p-3 text-center">{refund.allRefunds}</td>
                      <td className="p-3 text-center">{refund.openedRefund}</td>
                      <td className="p-3 text-center">{refund.closedRefund}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* CHANGE REQUEST */}
        <Card className="mt-6">
          <div className="bg-indigo-700 text-white px-4 py-3">
            <span className="font-semibold">≡ CHANGE REQUEST</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">All Request</th>
                  <th className="text-center p-3 font-medium">Requested</th>
                  <th className="text-center p-3 font-medium">Approved</th>
                  <th className="text-center p-3 font-medium">Rejected</th>
                  <th className="text-center p-3 font-medium">Processing</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.changeRequests.map((request, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-medium">{request.status}</td>
                    <td className="p-3 text-center">{request.requested}</td>
                    <td className="p-3 text-center">{request.approved}</td>
                    <td className="p-3 text-center">{request.rejected}</td>
                    <td className="p-3 text-center">{request.processing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
