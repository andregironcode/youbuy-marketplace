import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductDetails } from "@/components/product/ProductDetails";
import { MessageButton } from "@/components/product/MessageButton";
import { SellerReviews } from "@/components/product/SellerReviews";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, MapPin, Share2, ShieldCheck, Star, Calendar, MessageCircle, ShoppingBag } from "lucide-react";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { LocationMap } from "@/components/map/LocationMap";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [activeImage, setActiveImage] = useState(0);

  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller_id(
            id,
            username,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      await supabase
        .from("products")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", id);

      return convertToProductType({
        ...data,
        profiles: data.seller_id,
      }, true);
    },
    enabled: !!id,
  });

  const isFavorite = favorites.some((favorite) => favorite === id);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your favorites",
      });
      return;
    }

    try {
      toggleFavorite(id as string);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title || "Check out this product",
          text: `Check out "${product?.title}" on YouBuy!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this item",
      });
      return;
    }
    
    navigate(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="animate-pulse bg-gray-200 rounded-lg h-[400px]"></div>
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 h-10 w-3/4 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-1/3 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/">Browse More Products</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const sellerId = typeof product.seller.id === 'object' 
    ? (product.seller.userId || '') 
    : product.seller.id;

  console.log("Seller ID for navigation:", sellerId);
  console.log("Full seller object:", product.seller);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 
                      ${index === activeImage ? "border-youbuy" : "border-transparent"}`}
                  >
                    <img
                      src={image}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              <span className="flex items-center">
                <Star className="mr-1 h-4 w-4" />
                {product.viewCount || 0} views
              </span>
              <span>|</span>
              <span className="flex items-center">
                <Heart className="mr-1 h-4 w-4" />
                {product.likeCount || 0} likes
              </span>
              <span>|</span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Listed on {format(new Date(product.createdAt || Date.now()), "MMM d, yyyy")}
              </span>
            </div>

            <div className="mt-8">
              <ProductDetails product={product} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Button
                variant="outline"
                className={`flex-1 ${isFavorite ? "bg-red-50 border-red-200 text-red-600" : ""}`}
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <Separator />

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.seller.avatar || ""} />
                    <AvatarFallback>
                      {product.seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{product.seller.name}</h3>
                      {product.seller.rating && product.seller.rating > 4.5 && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Member since {format(new Date(product.seller.joinedDate || Date.now()), "MMMM yyyy")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link to={`/seller/${sellerId}`}>
                      View profile
                    </Link>
                  </Button>
                  
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "Sign in required",
                          description: "Please sign in to message the seller",
                        });
                        return;
                      }
                      document.getElementById("message-button-trigger")?.click();
                    }}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Message Seller
                  </Button>
                  
                  <Button 
                    className="w-full py-6 text-lg font-semibold"
                    variant="action"
                    disabled={
                      product.status === 'sold' || 
                      product.status === 'reserved'
                    }
                    onClick={handleBuyNow}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                  
                  <div className="hidden">
                    <MessageButton
                      id="message-button-trigger"
                      product={product}
                      size="md"
                      fullWidth={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">{product.location || "Not specified"}</p>
                    </div>
                  </div>
                  
                  {product.coordinates && product.coordinates.latitude && product.coordinates.longitude && (
                    <LocationMap
                      latitude={product.coordinates.latitude}
                      longitude={product.coordinates.longitude}
                      height="150px"
                      zoom={13}
                      interactive={false}
                      showMarker={true}
                      approximate={true}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-youbuy" />
                  Safety Tips
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Meet in a safe, public place</li>
                  <li>• Don't pay in advance</li>
                  <li>• Check the item before paying</li>
                  <li>• Report suspicious users</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
