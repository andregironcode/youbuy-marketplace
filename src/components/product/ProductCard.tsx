import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/product";
import { MessageButton } from "./MessageButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: ProductType;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isFavorite, toggleFavorite, isAdding, isRemoving } = useFavorites();
  const { convertPrice } = useCurrency();
  const productIsFavorite = isFavorite(product.id);
  const [likes, setLikes] = useState(product.likeCount || 0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwnProduct = user && product.seller?.id === user.id;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the existing toggleFavorite function
    toggleFavorite(product.id);
    
    // Update like count in the database and locally
    if (!productIsFavorite) {
      setLikes(prev => prev + 1);
      await supabase
        .from('products')
        .update({ like_count: likes + 1 })
        .eq('id', product.id);
    } else {
      setLikes(prev => Math.max(0, prev - 1));
      await supabase
        .from('products')
        .update({ like_count: Math.max(0, likes - 1) })
        .eq('id', product.id);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOwnProduct) {
      navigate(`/product/${product.id}`);
    } else {
      navigate(`/checkout/${product.id}`);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOwnProduct) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <Card className="overflow-hidden group h-full">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-youbuy">
              New
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-2 right-2 ${productIsFavorite ? 'bg-white' : 'bg-white/80 hover:bg-white'} rounded-full`}
            onClick={handleFavoriteClick}
            disabled={isAdding || isRemoving}
          >
            <Heart className={`h-4 w-4 ${productIsFavorite ? 'fill-cta text-cta' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <h3 className="font-medium text-base line-clamp-1">{product.title}</h3>
          </Link>
        </div>
        <div className="mt-1">
          <p className="text-xl font-bold text-price">AED {product.price.toFixed(2)}</p>
        </div>
        <div className="mt-1 text-sm text-muted-foreground flex items-center">
          <span>{product.location}</span>
          <span className="mx-1">•</span>
          <span>{product.timeAgo}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={handleBuyNow}
            variant="success"
            size="sm"
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4" /> {isOwnProduct ? "View Details" : "Buy Now"}
          </Button>
          {!isOwnProduct && (
            <MessageButton product={product} size="sm" variant="outline" />
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" /> 
              <span>{likes}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" /> 
              <span>{product.viewCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
