import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavoriteSellers } from "@/hooks/useFavoriteSellers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SellerProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  banned: boolean;
  username: string;
  currency?: string;
  bio?: string;
  seller_stats?: any;
}

export const FavoriteSellersTab = () => {
  const { favoriteSellers, loadingFavoriteSellers, toggleFavoriteSeller } = useFavoriteSellers();
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSellerProfiles = async () => {
      if (!favoriteSellers || favoriteSellers.length === 0) {
        setSellerProfiles([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch seller profiles from the database that match the favorite seller IDs
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .in("id", favoriteSellers);

        if (error) {
          console.error("Error fetching favorite sellers:", error);
          setSellerProfiles([]);
        } else {
          // Use type assertion to overcome type incompatibility
          setSellerProfiles(data as SellerProfile[]);
        }
      } catch (err) {
        console.error("Error in favorite sellers fetch:", err);
        setSellerProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingFavoriteSellers) {
      fetchSellerProfiles();
    }
  }, [favoriteSellers, loadingFavoriteSellers]);

  if (loadingFavoriteSellers || loading) {
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
      {sellerProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellerProfiles.map((seller) => (
            <Card key={seller.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-youbuy/10 to-gray-100 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src={seller.avatar_url} alt={seller.full_name} />
                      <AvatarFallback>{seller.full_name?.substring(0, 2) || 'US'}</AvatarFallback>
                    </Avatar>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => toggleFavoriteSeller(seller.id)}
                    >
                      <Heart className="h-5 w-5 fill-youbuy text-youbuy" />
                    </Button>
                  </div>
                  
                  <div className="mb-2">
                    <Link 
                      to={`/seller/${seller.id}`} 
                      className="font-semibold text-lg hover:text-youbuy transition-colors"
                    >
                      {seller.full_name}
                    </Link>
                    
                    {seller.username && (
                      <Badge variant="outline" className="ml-2 text-xs">@{seller.username}</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Member since {format(new Date(seller.created_at), 'MMM yyyy')}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center text-xs bg-white rounded-full px-2 py-1 shadow-sm">
                      <span className="font-medium mr-1">0</span> listings
                    </div>
                    
                    <div className="flex items-center text-xs bg-white rounded-full px-2 py-1 shadow-sm">
                      <span className="font-medium mr-1">0</span> reviews
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-2 flex justify-between">
                  <Link to={`/seller/${seller.id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                  
                  <Button 
                    variant="link" 
                    size="sm" 
                    asChild
                    className="text-youbuy"
                  >
                    <Link to={`/messages?seller=${seller.id}`}>Message</Link>
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
