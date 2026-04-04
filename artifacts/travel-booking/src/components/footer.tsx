import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary font-sans">WanderWay</h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate travel companion. Book flights, buses, hotels, and holiday packages all in one place.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Book</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/flights" className="hover:text-primary transition-colors">Flights</Link></li>
              <li><Link href="/buses" className="hover:text-primary transition-colors">Buses</Link></li>
              <li><Link href="/hotels" className="hover:text-primary transition-colors">Hotels</Link></li>
              <li><Link href="/packages" className="hover:text-primary transition-colors">Holiday Packages</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/bookings" className="hover:text-primary transition-colors">Manage Bookings</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cancellation Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WanderWay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
