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
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneratedPackage {
  id: number;
  name: string;
  destination: string;
  duration: number;
  price: number;
  originalPrice: number;
  type: string;
  description: string;
  inclusions: string[];
  imageUrl: string;
  rating: number;
}

export function AIPackageGenerator({ onPackageGenerated }: { onPackageGenerated?: (pkg: GeneratedPackage) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("5");
  const [packageType, setPackageType] = useState("beach");
  const [budget, setBudget] = useState("medium");
  const [customPrompt, setCustomPrompt] = useState("");
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
      toast({
        variant: "destructive",
        title: "Destination Required",
        description: "Please enter a destination to generate a package.",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const budgetMultipliers = {
      budget: 0.7,
      medium: 1,
      luxury: 1.8,
    };

    const basePrice = parseInt(duration) * 3000 * budgetMultipliers[budget as keyof typeof budgetMultipliers];
    const discount = Math.floor(Math.random() * 20) + 10; // 10-30% discount
    const finalPrice = Math.round(basePrice * (1 - discount / 100));

    const inclusions = [
      "Accommodation",
      `${duration} days / ${parseInt(duration) - 1} nights`,
      packageType === "beach" ? "Beach Activities" : packageType === "adventure" ? "Adventure Sports" : "Cultural Tours",
      "Breakfast",
      budget === "luxury" ? "All Meals" : "Daily Breakfast",
      budget !== "budget" ? "Airport Transfer" : "",
      customPrompt.toLowerCase().includes("guide") ? "Tour Guide" : "",
    ].filter(Boolean);

    const descriptions: Record<string, string> = {
      beach: `Experience the pristine beaches and crystal-clear waters of ${destination}. Relax on golden sands, enjoy water sports, and witness breathtaking sunsets.`,
      adventure: `Embark on an adrenaline-pumping adventure in ${destination}. Trek through mountains, explore hidden trails, and challenge yourself with exciting activities.`,
      cultural: `Immerse yourself in the rich culture and heritage of ${destination}. Visit ancient temples, explore local markets, and savor authentic cuisine.`,
      family: `Create unforgettable memories with your family in ${destination}. Enjoy family-friendly activities, comfortable accommodations, and quality time together.`,
      honeymoon: `Celebrate your love in the romantic paradise of ${destination}. Indulge in luxury, privacy, and special moments designed for couples.`,
      wildlife: `Discover the incredible wildlife and natural beauty of ${destination}. Go on safari, spot exotic animals, and connect with nature.`,
    };

    const generatedPackage: GeneratedPackage = {
      id: Date.now(),
      name: `${budget === "luxury" ? "Luxury" : budget === "budget" ? "Budget-Friendly" : "Premium"} ${destination} ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Escape`,
      destination: destination.charAt(0).toUpperCase() + destination.slice(1),
      duration: parseInt(duration),
      price: finalPrice,
      originalPrice: Math.round(basePrice),
      type: packageType,
      description: customPrompt || descriptions[packageType] || `Explore the beauty of ${destination} with this carefully curated package.`,
      inclusions,
      imageUrl: destinationImages[destination.toLowerCase()] || destinationImages.default,
      rating: parseFloat((4 + Math.random()).toFixed(1)),
    };

    // Save to localStorage
    const existingPackages = JSON.parse(localStorage.getItem("customPackages") ?? "[]");
    existingPackages.push(generatedPackage);
    localStorage.setItem("customPackages", JSON.stringify(existingPackages));

    setIsGenerating(false);
    toast({
      title: "Package Generated! ✨",
      description: `"${generatedPackage.name}" has been created successfully.`,
    });

    if (onPackageGenerated) {
      onPackageGenerated(generatedPackage);
    }

    setIsOpen(false);
    // Reset form
    setDestination("");
    setDuration("5");
    setPackageType("beach");
    setBudget("medium");
    setCustomPrompt("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Let AI create the perfect holiday package based on your preferences. Just provide some details and we'll do the magic!
          </DialogDescription>
        </DialogHeader>

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
            <p className="text-xs text-muted-foreground">Enter the place you want to visit</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger id="package-type">
                  <SelectValue />
                </SelectTrigger>
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
              <SelectTrigger id="budget">
                <SelectValue />
              </SelectTrigger>
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
            <p className="text-xs text-muted-foreground">
              Add any special requirements or preferences
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <div className="font-semibold text-purple-900 dark:text-purple-100">AI will generate:</div>
                <ul className="text-muted-foreground space-y-0.5 text-xs">
                  <li>• Package name and description</li>
                  <li>• Optimized pricing with discounts</li>
                  <li>• Curated inclusions and activities</li>
                  <li>• Beautiful destination imagery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={generatePackage}
            disabled={isGenerating || !destination.trim()}
            className="gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Package
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
