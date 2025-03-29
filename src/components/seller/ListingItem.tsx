import { ProductType } from "@/types/product";
import { Button } from "../ui/button";
import { useNavigate, Link } from "react-router-dom";
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
  
  const isOwnProduct = user?.id === product.seller?.id;

  return (
    <div className="flex items-start gap-4 border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
      <Link to={`/product/${product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link to={`/product/${product.id}`} className="font-medium hover:text-youbuy transition-colors line-clamp-1">
                {product.title}
              </Link>
              <p className="text-price font-semibold text-lg">€{product.price.toFixed(2)}</p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              <p>Listed {product.timeAgo}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {showBuyButtons && !isOwnProduct && (
              <>
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Buy Now
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
              View Details
            </Button>
            {isOwnProduct && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/profile/edit-product/${product.id}`)}
              >
                Edit Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
