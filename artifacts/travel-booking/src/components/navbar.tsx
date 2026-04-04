import { Link, useLocation } from "wouter";
import { Plane, Bus, Building2, Map, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/flights", label: "Flights", icon: Plane },
    { href: "/buses", label: "Buses", icon: Bus },
    { href: "/hotels", label: "Hotels", icon: Building2 },
    { href: "/packages", label: "Packages", icon: Map },
    { href: "/bookings", label: "My Bookings", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-primary font-sans">
              WanderWay
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                    location.startsWith(item.href)
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold">WanderWay</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                          location.startsWith(item.href)
                            ? "text-foreground"
                            : "text-foreground/60"
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost">Sign In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
