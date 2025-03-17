
import { ProductType } from "@/types/product";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { MessageButton } from "../product/MessageButton";
import { useAuth } from "@/context/AuthContext";

interface ListingItemProps {
  product: ProductType;
  showBuyButtons?: boolean;
}

export const ListingItem = ({ product, showBuyButtons = true }: ListingItemProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine if this product belongs to the current user
  const isOwnProduct = user?.id === product.seller?.id;

  return (
    <div className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-price font-bold">€{product.price.toFixed(2)}</p>
            <h3 className="font-medium text-sm">{product.title}</h3>
          </div>
          <div className="mt-2 sm:mt-0 text-xs text-muted-foreground">
            <p>Listed {product.timeAgo}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {showBuyButtons && !isOwnProduct && (
          <>
            <Button 
              size="sm" 
              variant="action"
              onClick={() => navigate(`/checkout/${product.id}`)}
            >
              <ShoppingBag className="h-4 w-4" /> Buy
            </Button>
            <MessageButton 
              product={product} 
              size="sm" 
              variant="outline" 
            />
          </>
        )}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View
        </Button>
        {isOwnProduct && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/profile/edit-product/${product.id}`)}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};
