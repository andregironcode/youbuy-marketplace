
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/product";
import { MessageButton } from "./MessageButton";
import { useFavorites } from "@/hooks/useFavorites";

interface ProductCardProps {
  product: ProductType;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isFavorite, toggleFavorite, isAdding, isRemoving } = useFavorites();
  const productIsFavorite = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
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
            <Heart className={`h-4 w-4 ${productIsFavorite ? 'fill-youbuy text-youbuy' : 'text-muted-foreground'}`} />
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
          <p className="text-xl font-bold text-youbuy-dark">AED {product.price.toFixed(2)}</p>
        </div>
        <div className="mt-1 text-sm text-muted-foreground flex items-center">
          <span>{product.location}</span>
          <span className="mx-1">•</span>
          <span>{product.timeAgo}</span>
        </div>
        <div className="mt-3">
          <MessageButton product={product} size="sm" fullWidth />
        </div>
      </CardContent>
    </Card>
  );
};
