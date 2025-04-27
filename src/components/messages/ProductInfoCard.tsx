import { ProductType } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ProductInfoCardProps {
  product: ProductType;
  onReserve?: () => void;
  onSendMessage?: (message: string) => void;
}

export function ProductInfoCard({ product, onReserve, onSendMessage }: ProductInfoCardProps) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const [reserving, setReserving] = useState(false);

  const handleReserveClick = async () => {
    if (!user) return;
    if (product.product_status !== 'available') return;

    try {
      setReserving(true);

      // Update product status in database
      const { error } = await supabase
        .from('products')
        .update({ product_status: 'reserved' })
        .eq('id', product.id);

      if (error) throw error;

      // Send a reservation message
      if (onSendMessage) {
        onSendMessage(`I'd like to reserve this item: ${product.title}`);
      }

      // Call the onReserve callback if provided
      if (onReserve) {
        onReserve();
      }

      toast({
        title: "Item Reserved",
        description: "You've successfully reserved this item.",
      });

    } catch (error) {
      console.error('Error reserving product:', error);
      toast({
        variant: "destructive",
        title: "Reservation Failed",
        description: "There was an error reserving this item. Please try again.",
      });
    } finally {
      setReserving(false);
    }
  };

  const getStatusIcon = () => {
    switch (product.product_status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'reserved':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'sold':
        return <AlertCircle className="h-4 w-4 text-neutral" />;
      default:
        return null;
    }
  };

  return (
    <div className="daisy-card daisy-card-side bg-base-100 shadow-sm">
      <figure className="w-24 h-24 rounded-l-lg overflow-hidden flex-shrink-0">
        <img
          src={product.image_urls?.[0] || '/placeholder-product.jpg'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="daisy-card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="daisy-card-title text-base truncate mb-1">{product.title}</h3>
            <p className="text-base font-bold text-secondary mb-2">
              AED {formatCurrency(product.price)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 text-sm py-1 px-2",
                  product.product_status === "available" && "bg-success/10 text-success border-success/20",
                  product.product_status === "reserved" && "bg-warning/10 text-warning border-warning/20",
                  product.product_status === "sold" && "bg-neutral/10 text-neutral border-neutral/20"
                )}
              >
                {getStatusIcon()}
                <span className="ml-1">{product.product_status || 'available'}</span>
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/product/${product.id}`)}
              className="h-10 w-10 rounded-full"
              title="View product details"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>

            {product.product_status === 'available' && onReserve && (
              <Button
                variant="default"
                size="sm"
                onClick={handleReserveClick}
                disabled={reserving}
                className="daisy-btn daisy-btn-primary daisy-btn-sm px-3 py-2 h-auto"
              >
                {reserving ? (
                  <span className="daisy-loading daisy-loading-spinner daisy-loading-xs"></span>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Reserve
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
