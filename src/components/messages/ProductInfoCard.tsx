
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchProductInfo } from "@/utils/messageHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductInfoCardProps {
  product: any;
  productId?: string;
}

export const ProductInfoCard = ({ product, productId }: ProductInfoCardProps) => {
  const [productInfo, setProductInfo] = useState<any>(product);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const getProductInfo = async () => {
      // If we already have complete product info, use it
      if (product && product.title && product.price) {
        setProductInfo(product);
        return;
      }
      
      // If we have a productId but incomplete product info, fetch it
      if (productId) {
        setLoading(true);
        const fetchedProduct = await fetchProductInfo(productId);
        if (fetchedProduct) {
          setProductInfo(fetchedProduct);
        }
        setLoading(false);
      }
    };
    
    getProductInfo();
  }, [product, productId]);
  
  if (loading) {
    return (
      <div className="p-3 border-b bg-accent/5">
        <div className="flex items-center p-2">
          <Skeleton className="w-16 h-16 rounded mr-3" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!productInfo) return null;
  
  return (
    <div className="p-3 border-b bg-accent/5">
      <Link to={`/product/${productInfo.id}`} className="block hover:bg-accent/10 rounded-lg transition-colors">
        <div className="flex items-center p-2">
          <img 
            src={productInfo.image} 
            alt={productInfo.title} 
            className="w-16 h-16 object-cover rounded mr-3"
          />
          <div className="flex-1">
            <p className="font-medium">{productInfo.title}</p>
            <p className="text-youbuy font-bold">AED {productInfo.price.toFixed(2)}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
};
