import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DbPackage {
  id: number;
  name: string;
  destination: string;
  duration: number;
  pricePerPerson: number;
  finalPrice: number;
  type: string;
  description: string;
  inclusions: string[];
  images: string[];
  rating: number;
  createdBy: string;
  isEnabled: boolean;
}

export function AIPackageGenerator({ onPackageGenerated }: { onPackageGenerated?: (pkg: DbPackage) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "generating" | "exists" | "done">("form");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("5");
  const [packageType, setPackageType] = useState("beach");
  const [budget, setBudget] = useState("medium");
  const [customPrompt, setCustomPrompt] = useState("");
  const [existingPackage, setExistingPackage] = useState<DbPackage | null>(null);
  const { toast } = useToast();

  const destinationImages: Record<string, string> = {
    goa: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    rajasthan: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
    kashmir: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    thailand: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
  };

  const generatePackage = async () => {
    if (!destination.trim()) {
      toast({ variant: "destructive", title: "Destination Required", description: "Please enter a destination." });
      return;
    }

    setStep("generating");

    try {
      // 1. Check if an AI package for this destination already exists in DB
      const checkRes = await fetch(`/api/holiday-packages/check-destination?destination=${encodeURIComponent(destination.trim())}`);
      const checkData = await checkRes.json();

      if (checkData.exists && checkData.package) {
        // Return the existing package from DB — no duplicate
        setExistingPackage(checkData.package as DbPackage);
        setStep("exists");
        return;
      }

      // 2. Generate package data (simulate AI computation)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const budgetMultipliers = { budget: 0.7, medium: 1, luxury: 1.8 };
      const dur = parseInt(duration);
      const aiPrice = Math.round(dur * 3000 * budgetMultipliers[budget as keyof typeof budgetMultipliers]);
      const originalPrice = Math.round(aiPrice * 1.2);

      const descriptions: Record<string, string> = {
        beach: `Experience the pristine beaches and crystal-clear waters of ${destination}. Relax on golden sands, enjoy water sports, and witness breathtaking sunsets.`,
        adventure: `Embark on an adrenaline-pumping adventure in ${destination}. Trek through mountains, explore hidden trails, and challenge yourself with exciting activities.`,
        cultural: `Immerse yourself in the rich culture and heritage of ${destination}. Visit ancient temples, explore local markets, and savor authentic cuisine.`,
        family: `Create unforgettable memories with your family in ${destination}. Enjoy family-friendly activities, comfortable accommodations, and quality time together.`,
        honeymoon: `Celebrate your love in the romantic paradise of ${destination}. Indulge in luxury, privacy, and special moments designed for couples.`,
        wildlife: `Discover the incredible wildlife and natural beauty of ${destination}. Go on safari, spot exotic animals, and connect with nature.`,
      };

      const label = budget === "luxury" ? "Luxury" : budget === "budget" ? "Budget-Friendly" : "Premium";
      const typeCap = packageType.charAt(0).toUpperCase() + packageType.slice(1);
      const destCap = destination.trim().charAt(0).toUpperCase() + destination.trim().slice(1);

      const inclusions = [
        "Accommodation",
        `${dur} days / ${dur - 1} nights`,
        packageType === "beach" ? "Beach Activities" : packageType === "adventure" ? "Adventure Sports" : "Cultural Tours",
        budget === "luxury" ? "All Meals" : "Daily Breakfast",
        budget !== "budget" ? "Airport Transfer" : "",
        customPrompt.toLowerCase().includes("guide") ? "Tour Guide" : "",
      ].filter(Boolean);

      const imageUrl = destinationImages[destination.toLowerCase()] || destinationImages.default;

      // 3. Save to DB immediately — with createdBy: "ai" and aiPrice
      const saveRes = await fetch("/api/holiday-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${label} ${destCap} ${typeCap} Escape`,
          destination: destCap,
          type: packageType,
          duration: dur,
          nights: dur - 1,
          aiPrice,
          images: [imageUrl],
          highlights: [`${destCap} Sightseeing`, "Local Cuisine", typeCap, budget === "luxury" ? "Premium Stay" : "Comfortable Stay"],
          description: customPrompt.trim() || descriptions[packageType] || `Explore the beauty of ${destCap} with this curated package.`,
          inclusions,
          exclusions: ["Flights", "Personal expenses", "Travel insurance"],
          featured: false,
          createdBy: "ai",
          isEnabled: false,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save AI package");
      const saved = await saveRes.json() as DbPackage;

      setStep("done");
      toast({
        title: "Package Generated & Saved!",
        description: `"${saved.name}" saved. Admin must enable it before customers can see it.`,
      });

      if (onPackageGenerated) onPackageGenerated(saved);

      // Auto-close after a moment
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 1800);

    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Generation failed", description: "Please try again." });
      setStep("form");
    }
  };

  function useExistingPackage() {
    if (existingPackage && onPackageGenerated) onPackageGenerated(existingPackage);
    setIsOpen(false);
    resetForm();
  }

  function resetForm() {
    setStep("form");
    setDestination("");
    setDuration("5");
    setPackageType("beach");
    setBudget("medium");
    setCustomPrompt("");
    setExistingPackage(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI Package Generator
          </DialogTitle>
          <DialogDescription>
            Generate a holiday package and save it directly to the platform. Admin will review and control pricing before it goes live.
          </DialogDescription>
        </DialogHeader>

        {/* ── Generating state ── */}
        {step === "generating" && (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Generating Package…</p>
              <p className="text-sm text-muted-foreground mt-1">Checking database & building your itinerary</p>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          </div>
        )}

        {/* ── Package already exists ── */}
        {step === "exists" && existingPackage && (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Package Already Exists</p>
              <p className="text-sm text-muted-foreground mt-1">
                An AI-generated package for <span className="font-semibold">{existingPackage.destination}</span> is already in our database. No duplicate will be created.
              </p>
            </div>
            <div className="bg-slate-50 border rounded-xl p-4 w-full text-left">
              <p className="font-bold text-slate-900">{existingPackage.name}</p>
              <p className="text-sm text-muted-foreground">{existingPackage.destination} · {existingPackage.duration} days</p>
              <p className="text-purple-700 font-bold mt-1">₹{existingPackage.pricePerPerson?.toLocaleString()} / person</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={resetForm}>Generate Different</Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={useExistingPackage}>Use This Package</Button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Package Saved to Database!</p>
              <p className="text-sm text-muted-foreground mt-1">Admin will review and set the final price. It will appear live once enabled.</p>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {step === "form" && (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Goa, Maldives, Dubai, Bali"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="font-medium"
                />
                <p className="text-xs text-muted-foreground">If this destination already exists in DB, the existing package will be returned</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days / 2 Nights</SelectItem>
                      <SelectItem value="5">5 Days / 4 Nights</SelectItem>
                      <SelectItem value="7">7 Days / 6 Nights</SelectItem>
                      <SelectItem value="10">10 Days / 9 Nights</SelectItem>
                      <SelectItem value="14">14 Days / 13 Nights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-type">Package Type</Label>
                  <Select value={packageType} onValueChange={setPackageType}>
                    <SelectTrigger id="package-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beach">🏖️ Beach</SelectItem>
                      <SelectItem value="adventure">🏔️ Adventure</SelectItem>
                      <SelectItem value="cultural">🏛️ Cultural</SelectItem>
                      <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                      <SelectItem value="honeymoon">💑 Honeymoon</SelectItem>
                      <SelectItem value="wildlife">🦁 Wildlife</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Category</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="budget"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">💰 Budget-Friendly</SelectItem>
                    <SelectItem value="medium">⭐ Premium</SelectItem>
                    <SelectItem value="luxury">💎 Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Special Requirements (Optional)</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="e.g., Include guided tours, vegetarian meals, wheelchair accessible..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="space-y-0.5 text-xs">
                  <li>• AI generates package → saved immediately to database</li>
                  <li>• Admin sets/overrides the final price before it goes live</li>
                  <li>• Customers only ever see the admin-approved price</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={generatePackage}
                disabled={!destination.trim()}
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4" />
                Generate & Save to DB
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
