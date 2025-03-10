
import { useState } from "react";
import { Share, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductType } from "@/types/product";
import { MessageButton } from "./MessageButton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { ProductSpecifications } from "./ProductSpecifications"; 

interface ProductDetailsProps {
  product: ProductType;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [likeCount, setLikeCount] = useState(product.likeCount || 0);
  const isFavorited = isFavorite(product.id);
  
  const handleFavoriteClick = async () => {
    toggleFavorite(product.id);
    
    // Update like count in the database and locally
    if (!isFavorited) {
      setLikeCount(prev => prev + 1);
      await supabase
        .from('products')
        .update({ like_count: likeCount + 1 })
        .eq('id', product.id);
    } else {
      setLikeCount(prev => Math.max(0, prev - 1));
      await supabase
        .from('products')
        .update({ like_count: Math.max(0, likeCount - 1) })
        .eq('id', product.id);
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Check if seller ID is available
  const hasSellerProfile = product.seller && product.seller.userId;

  return (
    <div className="flex flex-col">
      {/* Product title and actions */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full"
            onClick={handleShareClick}
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 rounded-full ${isFavorited ? 'bg-youbuy-light' : ''}`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-youbuy text-youbuy' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Price and badges */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-3xl font-bold text-youbuy">AED {product.price.toFixed(2)}</p>
        {product.isNew && (
          <Badge className="bg-youbuy">New</Badge>
        )}
        {product.isFeatured && (
          <Badge variant="outline" className="border-youbuy text-youbuy">Featured</Badge>
        )}
      </div>

      {/* Location and date */}
      <div className="flex items-center gap-4 mb-6 text-muted-foreground">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{product.location}</span>
        </div>
        <span>•</span>
        <span>{product.timeAgo}</span>
      </div>

      {/* Seller info */}
      <div className="flex items-center justify-between border-t border-b py-4 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={product.seller?.avatar} />
            <AvatarFallback>{product.seller?.name?.substring(0, 2) || 'UN'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {hasSellerProfile ? (
                <Link to={`/seller/${product.seller.userId}`} className="hover:text-youbuy">
                  {product.seller.name}
                </Link>
              ) : (
                product.seller?.name || "Unknown Seller"
              )}
            </p>
            <p className="text-sm text-muted-foreground">Member since {product.seller?.joinedDate || "Unknown"}</p>
          </div>
        </div>
        <MessageButton product={product} />
      </div>

      {/* Product description */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
      </div>

      {/* Product specifications */}
      <ProductSpecifications product={product} />
    </div>
  );
};
