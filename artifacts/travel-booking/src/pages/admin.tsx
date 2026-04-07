import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plane, 
  Bus, 
  Building2, 
  Map, 
  CreditCard, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Package,
  Tag,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Percent,
  IndianRupee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [balance] = useState(480);
  const { toast } = useToast();

  // Coupon state
  const [coupons, setCoupons] = useState<Array<{
    code: string;
    discount: number;
    discountType: "fixed" | "percentage";
    validUntil: string;
  }>>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    discountType: "fixed" as "fixed" | "percentage",
    validUntil: ""
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Package state
  const [packages, setPackages] = useState<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    destination: string;
  }>>([]);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    destination: ""
  });
  const [showDeletePackageDialog, setShowDeletePackageDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  // Load coupons and packages from localStorage
  useEffect(() => {
    const savedCoupons = localStorage.getItem("coupons");
    if (savedCoupons) {
      try {
        setCoupons(JSON.parse(savedCoupons));
      } catch (e) {
        console.error("Error loading coupons:", e);
        setCoupons([]);
      }
    }

    const savedPackages = localStorage.getItem("packages");
    if (savedPackages) {
      try {
        setPackages(JSON.parse(savedPackages));
      } catch (e) {
        console.error("Error loading packages:", e);
        setPackages([]);
      }
    }
  }, []);

  // Save coupons to localStorage
  const saveCoupons = (updatedCoupons: typeof coupons) => {
    localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
    setCoupons(updatedCoupons);
  };

  // Add new coupon
  const handleAddCoupon = () => {
    const code = newCoupon.code.trim().toUpperCase();
    const discount = parseFloat(newCoupon.discount);
    const validUntil = newCoupon.validUntil;

    if (!code) {
      toast({
        variant: "destructive",
        title: "Invalid Coupon Code",
        description: "Please enter a coupon code.",
      });
      return;
    }

    if (isNaN(discount) || discount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Discount",
        description: "Please enter a valid discount amount greater than 0.",
      });
      return;
    }

    if (newCoupon.discountType === "percentage" && discount > 100) {
      toast({
        variant: "destructive",
        title: "Invalid Percentage",
        description: "Percentage discount cannot exceed 100%.",
      });
      return;
    }

    if (!validUntil) {
      toast({
        variant: "destructive",
        title: "Invalid Expiry Date",
        description: "Please select an expiry date.",
      });
      return;
    }

    if (coupons.some(c => c.code === code)) {
      toast({
        variant: "destructive",
        title: "Duplicate Coupon",
        description: `Coupon code "${code}" already exists.`,
      });
      return;
    }

    const updatedCoupons = [
      ...coupons,
      {
        code,
        discount,
        discountType: newCoupon.discountType,
        validUntil
      }
    ];

    saveCoupons(updatedCoupons);

    toast({
      title: "Coupon Added Successfully!",
      description: `Coupon "${code}" has been created.`,
    });

    setNewCoupon({
      code: "",
      discount: "",
      discountType: "fixed",
      validUntil: ""
    });
  };

  // Delete coupon
  const handleDeleteCoupon = (code: string) => {
    setCouponToDelete(code);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCoupon = () => {
    if (!couponToDelete) return;

    const updatedCoupons = coupons.filter(c => c.code !== couponToDelete);
    saveCoupons(updatedCoupons);

    toast({
      title: "Coupon Deleted",
      description: `Coupon "${couponToDelete}" has been removed.`,
    });

    setShowDeleteDialog(false);
    setCouponToDelete(null);
  };

  // Check if coupon is expired
  const isCouponExpired = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  // Package Management Functions
  const handleAddPackage = () => {
    const name = newPackage.name.trim();
    const description = newPackage.description.trim();
    const price = parseFloat(newPackage.price);
    const duration = newPackage.duration.trim();
    const destination = newPackage.destination.trim();

    if (!name) {
      toast({
        variant: "destructive",
        title: "Invalid Package Name",
        description: "Please enter a package name.",
      });
      return;
    }

    if (!description) {
      toast({
        variant: "destructive",
        title: "Invalid Description",
        description: "Please enter a package description.",
      });
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0.",
      });
      return;
    }

    if (!duration) {
      toast({
        variant: "destructive",
        title: "Invalid Duration",
        description: "Please enter package duration (e.g., 5 Days 4 Nights).",
      });
      return;
    }

    if (!destination) {
      toast({
        variant: "destructive",
        title: "Invalid Destination",
        description: "Please enter a destination.",
      });
      return;
    }

    const newPackageData = {
      id: `PKG-${Date.now()}`,
      name,
      description,
      price,
      duration,
      destination
    };

    const updatedPackages = [...packages, newPackageData];
    setPackages(updatedPackages);
    localStorage.setItem("packages", JSON.stringify(updatedPackages));

    toast({
      title: "Package Added Successfully!",
      description: `Package "${name}" has been created.`,
    });

    setNewPackage({
      name: "",
      description: "",
      price: "",
      duration: "",
      destination: ""
    });
    setShowPackageDialog(false);
  };

  const handleDeletePackage = (id: string) => {
    setPackageToDelete(id);
    setShowDeletePackageDialog(true);
  };

  const confirmDeletePackage = () => {
    if (!packageToDelete) return;

    const updatedPackages = packages.filter(p => p.id !== packageToDelete);
    setPackages(updatedPackages);
    localStorage.setItem("packages", JSON.stringify(updatedPackages));

    const deletedPackage = packages.find(p => p.id === packageToDelete);
    toast({
      title: "Package Deleted",
      description: `Package "${deletedPackage?.name}" has been removed.`,
    });

    setShowDeletePackageDialog(false);
    setPackageToDelete(null);
  };

  // Mock statistics data
  const stats = {
    flightBookings: 63,
    hotelBookings: 1,
    holidayBookings: 0,
    busBookings: 16,
    visaBookings: 0,
    activitiesBookings: 0,
    totalRevenue: 480,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6 px-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-primary-foreground/80 text-sm">Manage bookings, coupons, and more</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Account Balance</p>
              <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Plane className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.flightBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Flight Bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.hotelBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Hotel Bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Map className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.holidayBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Holiday Bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Bus className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.busBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Bus Bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.visaBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Visa Bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-700 to-gray-800 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.activitiesBookings}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Activities</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">₹{stats.totalRevenue}</span>
                </div>
                <p className="text-sm font-medium opacity-90">Total Revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="coupons" className="space-y-6">
            <TabsList className="bg-primary/10 p-1">
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            {/* Coupons Tab */}
            <TabsContent value="coupons">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Coupon Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Add New Coupon Form */}
                  <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Coupon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coupon-code">Coupon Code *</Label>
                        <Input
                          id="coupon-code"
                          placeholder="e.g., SAVE100"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className="uppercase font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-type">Discount Type *</Label>
                        <Select
                          value={newCoupon.discountType}
                          onValueChange={(value: "fixed" | "percentage") => 
                            setNewCoupon({ ...newCoupon, discountType: value })
                          }
                        >
                          <SelectTrigger id="discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-amount">
                          Discount {newCoupon.discountType === "fixed" ? "(₹)" : "(%)"} *
                        </Label>
                        <div className="relative">
                          <Input
                            id="discount-amount"
                            type="number"
                            placeholder={newCoupon.discountType === "fixed" ? "500" : "10"}
                            value={newCoupon.discount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                            className="pr-8"
                            min="0"
                            max={newCoupon.discountType === "percentage" ? "100" : undefined}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {newCoupon.discountType === "fixed" ? (
                              <IndianRupee className="w-4 h-4" />
                            ) : (
                              <Percent className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valid-until">Valid Until *</Label>
                        <div className="relative">
                          <Input
                            id="valid-until"
                            type="date"
                            value={newCoupon.validUntil}
                            onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddCoupon} 
                          className="w-full"
                          size="lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Coupon
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Active Coupons List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Active Coupons ({coupons.length})
                    </h3>

                    {coupons.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                        <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-lg font-medium">No coupons created yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first coupon to offer discounts to customers</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coupons.map((coupon) => {
                          const expired = isCouponExpired(coupon.validUntil);
                          return (
                            <Card 
                              key={coupon.code} 
                              className={cn(
                                "relative overflow-hidden transition-all hover:shadow-lg",
                                expired && "opacity-60"
                              )}
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />
                              
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge 
                                        variant={expired ? "secondary" : "default"}
                                        className="font-mono text-lg px-3 py-1"
                                      >
                                        {coupon.code}
                                      </Badge>
                                      {expired && (
                                        <Badge variant="destructive" className="text-xs">
                                          Expired
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                      {coupon.discountType === "fixed" ? (
                                        <>
                                          <IndianRupee className="w-5 h-5" />
                                          {coupon.discount.toFixed(0)}
                                        </>
                                      ) : (
                                        <>
                                          {coupon.discount}
                                          <Percent className="w-5 h-5" />
                                        </>
                                      )}
                                      <span className="text-sm text-muted-foreground font-normal">
                                        OFF
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCoupon(coupon.code)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Expires: {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                {expired && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                                    <XCircle className="w-3 h-3" />
                                    <span>This coupon has expired</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delete Confirmation Dialog */}
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Coupon</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete coupon <strong className="font-mono">{couponToDelete}</strong>? 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDeleteCoupon}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Coupon
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Manage Holiday Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Create and manage holiday packages for your customers
                    </p>
                    <Button onClick={() => setShowPackageDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Package
                    </Button>
                  </div>

                  {packages.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-lg font-medium">No packages created yet</p>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first holiday package</p>
                      <Button onClick={() => setShowPackageDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Package
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {packages.map((pkg) => (
                        <Card key={pkg.id} className="hover:shadow-lg transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-1">{pkg.name}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Map className="w-4 h-4" />
                                  <span>{pkg.destination}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {pkg.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{pkg.duration}</span>
                              </div>
                              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                <IndianRupee className="w-5 h-5" />
                                <span>{pkg.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Package Dialog */}
              <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Holiday Package</DialogTitle>
                    <DialogDescription>
                      Create a new holiday package with all the details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="pkg-name">Package Name *</Label>
                      <Input
                        id="pkg-name"
                        placeholder="e.g., Goa Beach Paradise"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pkg-destination">Destination *</Label>
                      <Input
                        id="pkg-destination"
                        placeholder="e.g., Goa, India"
                        value={newPackage.destination}
                        onChange={(e) => setNewPackage({ ...newPackage, destination: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pkg-price">Price (₹) *</Label>
                        <div className="relative">
                          <Input
                            id="pkg-price"
                            type="number"
                            placeholder="15000"
                            value={newPackage.price}
                            onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                            className="pr-8"
                            min="0"
                          />
                          <IndianRupee className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pkg-duration">Duration *</Label>
                        <Input
                          id="pkg-duration"
                          placeholder="e.g., 5 Days 4 Nights"
                          value={newPackage.duration}
                          onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pkg-description">Description *</Label>
                      <Textarea
                        id="pkg-description"
                        placeholder="Enter package description, highlights, and inclusions..."
                        value={newPackage.description}
                        onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPackage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Package Confirmation Dialog */}
              <Dialog open={showDeletePackageDialog} onOpenChange={setShowDeletePackageDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Package</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this package? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeletePackageDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDeletePackage}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Package
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center py-8">User management features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
