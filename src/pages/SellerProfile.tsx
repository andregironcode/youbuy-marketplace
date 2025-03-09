
import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  Package, 
  Truck, 
  Building2,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { ProductType } from "@/types/product";
import { SellerReviews } from "@/components/product/SellerReviews";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useFavoriteSellers } from "@/hooks/useFavoriteSellers";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const { toast } = useToast();
  const { user } = useAuth();
  const { isFavoriteSeller, toggleFavoriteSeller, isAdding, isRemoving } = useFavoriteSellers();
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "listings");

  // Find seller info from the products data (in a real app, this would come from the API)
  const sellerProducts = products.filter(p => p.seller.userId === id);
  const sellerInfo = sellerProducts.length > 0 ? sellerProducts[0].seller : null;

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabFromUrl && ['listings', 'reviews', 'info'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch seller reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['seller-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('seller_reviews')
        .select('*')
        .eq('seller_id', id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message this seller",
      });
      return;
    }
    
    // In a real app, this would navigate to messages or open a message dialog
    toast({
      title: "Contact seller",
      description: "Message functionality would open here",
    });
  };

  if (!sellerInfo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seller Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The seller you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6">
        {/* Seller profile card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={sellerInfo.avatar} alt={sellerInfo.name} />
                <AvatarFallback>{sellerInfo.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h1 className="text-2xl font-bold">{sellerInfo.name}</h1>
                  {sellerInfo.businessAccount && (
                    <Badge variant="outline" className="ml-0 md:ml-2">
                      <Building2 className="h-3 w-3 mr-1" />
                      Business account
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= (sellerInfo.rating || 0) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm">
                    ({sellerInfo.totalReviews || 0})
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {sellerInfo.joinedDate}
                </p>
                
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm text-muted-foreground">Madrid, Spain</span>
                  <Button variant="link" size="sm" className="text-youbuy h-auto p-0 pl-1">
                    View location
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Stats and actions */}
            <div className="flex-1 mt-4 md:mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 mr-1 text-youbuy" />
                    <span className="font-semibold">{sellerInfo.totalSales || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Package className="h-4 w-4 mr-1 text-youbuy" />
                    <span className="font-semibold">{sellerInfo.totalPurchases || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Purchases</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Truck className="h-4 w-4 mr-1 text-youbuy" />
                    <span className="font-semibold">{sellerInfo.totalShipments || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Shipments</p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleContactSeller}
                  className="bg-youbuy hover:bg-youbuy-dark w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => id && toggleFavoriteSeller(id)}
                  className="w-full"
                  disabled={isAdding || isRemoving}
                >
                  <Heart className={`mr-2 h-4 w-4 ${id && isFavoriteSeller(id) ? "fill-youbuy text-youbuy" : ""}`} />
                  {id && isFavoriteSeller(id) ? "Favorited" : "Favorite user"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="mb-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="listings" className="text-center">
                <span className="font-semibold">{sellerInfo.totalListings || sellerProducts.length}</span>
                <span className="ml-2">Published</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-center">
                <span className="font-semibold">{sellerInfo.totalReviews || 0}</span>
                <span className="ml-2">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="text-center">
                <span className="font-semibold">+</span>
                <span className="ml-2">Info</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sellerProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
                
                {sellerProducts.length === 0 && (
                  <div className="col-span-full py-10 text-center">
                    <p className="text-muted-foreground">No products listed yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <SellerReviews 
                sellerId={id || ''} 
                sellerName={sellerInfo.name}
              />
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed information about this seller, including their selling preferences, 
                  shipping options, and return policies.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Shipping Options</h4>
                    <p className="text-sm text-muted-foreground">
                      This seller offers both local pickup and shipping services.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Return Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Returns accepted within 7 days of purchase.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Payment Methods</h4>
                    <p className="text-sm text-muted-foreground">
                      Cash, bank transfer, and in-app payments.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SellerProfile;
