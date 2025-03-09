
import React from "react";
import { Link } from "react-router-dom";
import { useFavoriteSellers } from "@/hooks/useFavoriteSellers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Heart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const FavoriteSellersTab = () => {
  const { favoriteSellers, loadingFavoriteSellers, toggleFavoriteSeller } = useFavoriteSellers();
  
  // Get unique seller info from products data
  const uniqueSellers = React.useMemo(() => {
    const sellers = new Map();
    
    products.forEach(product => {
      if (product.seller.userId && !sellers.has(product.seller.userId)) {
        sellers.set(product.seller.userId, product.seller);
      }
    });
    
    return Array.from(sellers.values());
  }, []);
  
  // Filter sellers to only show favorite ones
  const favoriteSellersData = uniqueSellers.filter(
    seller => seller.userId && favoriteSellers?.includes(seller.userId)
  );

  if (loadingFavoriteSellers) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-lg border shadow animate-pulse bg-gray-100 h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {favoriteSellersData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteSellersData.map((seller) => (
            <Card key={seller.userId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-youbuy/10 to-gray-100 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src={seller.avatar} alt={seller.name} />
                      <AvatarFallback>{seller.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => seller.userId && toggleFavoriteSeller(seller.userId)}
                    >
                      <Heart className="h-5 w-5 fill-youbuy text-youbuy" />
                    </Button>
                  </div>
                  
                  <div className="mb-2">
                    <Link 
                      to={`/seller/${seller.userId}`} 
                      className="font-semibold text-lg hover:text-youbuy transition-colors"
                    >
                      {seller.name}
                    </Link>
                    
                    {seller.businessAccount && (
                      <Badge variant="outline" className="ml-2 text-xs">Business</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">Member since {seller.joinedDate}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center text-xs bg-white rounded-full px-2 py-1 shadow-sm">
                      <span className="font-medium mr-1">{seller.totalListings || 0}</span> listings
                    </div>
                    
                    <div className="flex items-center text-xs bg-white rounded-full px-2 py-1 shadow-sm">
                      <span className="font-medium mr-1">{seller.totalReviews || 0}</span> reviews
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-2 flex justify-between">
                  <Link to={`/seller/${seller.userId}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                  
                  <Button 
                    variant="link" 
                    size="sm" 
                    asChild
                    className="text-youbuy"
                  >
                    <Link to={`/messages?seller=${seller.userId}`}>Message</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No favorite sellers yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            When you find a seller you like, add them to your favorites to keep track of their listings.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-youbuy hover:bg-youbuy-dark text-white px-4 py-2 rounded-full"
          >
            Discover sellers
          </Button>
        </div>
      )}
    </div>
  );
};
