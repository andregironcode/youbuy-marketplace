
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
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-muted animate-pulse"></div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-muted animate-pulse rounded-md"></div>
              <div className="h-2.5 w-20 bg-muted animate-pulse rounded-md"></div>
            </div>
            <div className="ml-auto h-4 w-14 bg-muted animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-md">
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
              <p className="font-medium line-clamp-1 text-sm">{product.title}</p>
              <p className="text-xs text-muted-foreground">
                ${product.price}
              </p>
            </div>
            <div className="ml-auto font-medium text-sm">
              {product.viewCount} views
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
