import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";

import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Flights from "@/pages/flights";
import FlightDetail from "@/pages/flight-detail";
import Buses from "@/pages/buses";
import BusDetail from "@/pages/bus-detail";
import Hotels from "@/pages/hotels";
import HotelDetail from "@/pages/hotel-detail";
import Packages from "@/pages/packages";
import PackageDetail from "@/pages/package-detail";
import Bookings from "@/pages/bookings";
import BookingDetail from "@/pages/booking-detail";
import SeatSelectionPage from "@/pages/seat-selection-page";
import PassengerDetailsPage from "@/pages/passenger-details-page";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailed from "@/pages/payment-failed";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries only once (instead of 3 times default)
      retry: 1,
      // Suppress React Query refetch on window focus
      refetchOnWindowFocus: false,
      // Stale time - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/flights" component={Flights} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/flights/:id" component={FlightDetail} />
      <Route path="/buses" component={Buses} />
      <Route path="/buses/:id" component={BusDetail} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/hotels/:id" component={HotelDetail} />
      <Route path="/packages" component={Packages} />
      <Route path="/packages/:id" component={PackageDetail} />
      <Route path="/booking/seat-selection/:type/:id" component={SeatSelectionPage} />
      <Route path="/booking/passenger-details" component={PassengerDetailsPage} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id" component={BookingDetail} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-failed" component={PaymentFailed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
