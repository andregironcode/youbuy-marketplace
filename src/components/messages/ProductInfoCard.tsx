import { ProductType } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductInfoCardProps {
  product: ProductType;
}

export function ProductInfoCard({ product }: ProductInfoCardProps) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  return (
    <div className="flex items-start gap-3 py-1.5 px-2 bg-white">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={product.image_urls?.[0] || '/placeholder-product.jpg'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0">
        <h3 className="font-medium text-sm truncate mb-1">{product.title}</h3>
        <p className="text-sm text-muted-foreground">
          AED {formatCurrency(product.price)}
        </p>
        {product.product_status && (
          <Badge variant={product.product_status === 'sold' ? 'destructive' : 'secondary'} className="text-xs mt-0.5 w-fit">
            {product.product_status}
          </Badge>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/product/${product.id}`)}
        className="h-6 w-6"
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}
