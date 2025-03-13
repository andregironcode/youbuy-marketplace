
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export const TopProducts = () => {
  const { user } = useAuth();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["user-top-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("view_count", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data as ProductType[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded-md"></div>
              <div className="h-3 w-24 bg-muted animate-pulse rounded-md"></div>
            </div>
            <div className="ml-auto h-5 w-16 bg-muted animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center gap-4">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage 
              src={product.image_urls?.[0]} 
              alt={product.title} 
              className="object-cover"
            />
            <AvatarFallback className="rounded-md">
              {product.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium line-clamp-1">{product.title}</p>
            <p className="text-sm text-muted-foreground">
              ${product.price}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {product.view_count} views
          </div>
        </div>
      ))}
    </div>
  );
};
