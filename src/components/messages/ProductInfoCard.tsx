
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface ProductInfoCardProps {
  product: any;
}

export const ProductInfoCard = ({ product }: ProductInfoCardProps) => {
  if (!product) return null;
  
  return (
    <div className="p-3 border-b bg-accent/5">
      <Link to={`/product/${product.id}`} className="block hover:bg-accent/10 rounded-lg transition-colors">
        <div className="flex items-center p-2">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-16 h-16 object-cover rounded mr-3"
          />
          <div className="flex-1">
            <p className="font-medium">{product.title}</p>
            <p className="text-youbuy font-bold">AED {product.price.toFixed(2)}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
};
