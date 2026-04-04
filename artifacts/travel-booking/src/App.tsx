import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Admin from "./pages/admin";
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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/flights" component={Flights} />
      <Route path="/flights/:id" component={FlightDetail} />
      <Route path="/admin" component={Admin} />
      <Route path="/buses" component={Buses} />
      <Route path="/buses/:id" component={BusDetail} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/hotels/:id" component={HotelDetail} />
      <Route path="/packages" component={Packages} />
      <Route path="/packages/:id" component={PackageDetail} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id" component={BookingDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
