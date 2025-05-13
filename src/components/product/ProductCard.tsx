import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingBag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/product";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageButton } from "@/components/messages/MessageButton";

interface ProductCardProps {
  product: ProductType;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { favorites, addFavorite, removeFavorite, isAdding, isRemoving } = useFavorites();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const [likes, setLikes] = useState(product.likeCount || 0);
  const productIsFavorite = favorites?.includes(product.id);
  const isOwnProduct = user?.id === product.seller?.id;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the existing toggleFavorite function
    if (productIsFavorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }

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


  return (
    <Card className="group w-full overflow-hidden border rounded-lg transition-all duration-300 hover:shadow-md flex flex-col">
      <div className="relative rounded-t-lg bg-gray-100 overflow-hidden flex items-center justify-center h-48">
        <Link to={`/product/${product.id}`} className="block h-full w-full relative">
          <img
            src={product.image_urls?.[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          {product.product_status === 'sold' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1 px-4">
                SOLD
              </Badge>
            </div>
          )}
          {product.product_status === 'reserved' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg py-1 px-4 bg-amber-100 text-amber-800">
                RESERVED
              </Badge>
            </div>
          )}
          <Button
            variant={productIsFavorite ? "default" : "outline"}
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleFavoriteClick}
            disabled={isAdding || isRemoving}
          >
            <Heart fill={productIsFavorite ? "white" : "none"} className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <h3 className="font-medium text-base line-clamp-1">{product.title}</h3>
          </Link>
        </div>
        <div className="mt-1">
          <p className="text-xl font-bold text-price">AED {formatCurrency(product.price)}</p>
        </div>
        <div className="mt-1 text-sm text-muted-foreground line-clamp-1 min-h-[1.5rem]">
          <span>{product.location}</span>
          <span className="mx-1">•</span>
          <span>{product.timeAgo}</span>
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
};
