
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, MessageCircle, Package, ShoppingBag, Truck, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavoriteSellers } from "@/hooks/useFavoriteSellers";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface SellerProfileHeaderProps {
  sellerInfo: {
    userId?: string;
    name: string;
    avatar: string;
    rating?: number;
    totalReviews?: number;
    joinedDate: string;
    businessAccount?: boolean;
    totalSales?: number;
    totalPurchases?: number;
    totalShipments?: number;
  };
}

export const SellerProfileHeader = ({ sellerInfo }: SellerProfileHeaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isFavoriteSeller, toggleFavoriteSeller, isAdding, isRemoving } = useFavoriteSellers();

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

  return (
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
              <SellerRating rating={sellerInfo.rating || 0} totalReviews={sellerInfo.totalReviews || 0} />
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
              onClick={() => sellerInfo.userId && toggleFavoriteSeller(sellerInfo.userId)}
              className="w-full"
              disabled={isAdding || isRemoving}
            >
              <Heart className={`mr-2 h-4 w-4 ${sellerInfo.userId && isFavoriteSeller(sellerInfo.userId) ? "fill-youbuy text-youbuy" : ""}`} />
              {sellerInfo.userId && isFavoriteSeller(sellerInfo.userId) ? "Favorited" : "Favorite user"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted star rating component
export const SellerRating = ({ rating, totalReviews }: { rating: number; totalReviews: number }) => {
  return (
    <>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="ml-2 text-sm">
        ({totalReviews})
      </span>
    </>
  );
};
