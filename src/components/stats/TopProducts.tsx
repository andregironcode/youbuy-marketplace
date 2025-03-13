
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TopProducts = () => {
  const { user } = useAuth();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["user-top-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          profiles:seller_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("seller_id", user.id)
        .order("view_count", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Convert the raw data to ProductType format
      return data.map(item => convertToProductType(item, true));
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-2"> {/* Reduced space-y-3 to space-y-2 */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2"> {/* Reduced gap-3 to gap-2 */}
            <div className="w-8 h-8 rounded-md bg-muted animate-pulse"></div> {/* Reduced size */}
            <div className="space-y-1"> {/* Reduced space-y-1.5 to space-y-1 */}
              <div className="h-3 w-24 bg-muted animate-pulse rounded-md"></div> {/* Reduced height */}
              <div className="h-2 w-16 bg-muted animate-pulse rounded-md"></div> {/* Reduced height and width */}
            </div>
            <div className="ml-auto h-3 w-12 bg-muted animate-pulse rounded-md"></div> {/* Reduced height and width */}
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-2 text-sm"> {/* Reduced padding and font size */}
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2"> {/* Reduced right padding */}
      <div className="space-y-2"> {/* Reduced space-y-3 to space-y-2 */}
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-2"> {/* Reduced gap-3 to gap-2 */}
            <Avatar className="h-8 w-8 rounded-md"> {/* Reduced size */}
              <AvatarImage 
                src={product.image} 
                alt={product.title} 
                className="object-cover"
              />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
                {product.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium line-clamp-1 text-xs"> {/* Reduced text-sm to text-xs */}
                {product.title}
              </p>
              <p className="text-xs text-muted-foreground">
                ${product.price}
              </p>
            </div>
            <div className="ml-auto font-medium text-xs"> {/* Reduced text-sm to text-xs */}
              {product.viewCount} views
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
