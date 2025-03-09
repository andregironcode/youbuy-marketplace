
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
      
      return data.map(fav => fav.product_id);
    },
    enabled: !!user,
  });

  // Add to favorites
  const { mutate: addToFavorites, isPending: isAdding } = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          throw new Error("Already in favorites");
        }
        throw error;
      }
    },
    onSuccess: (_, productId) => {
      queryClient.setQueryData(
        ["favorites", user?.id], 
        (old: string[] = []) => [...old, productId]
      );
      toast({
        title: "Added to favorites",
        description: "This item has been added to your favorites",
      });
    },
    onError: (error) => {
      if (error.message === "Already in favorites") {
        toast({
          title: "Already saved",
          description: "This item is already in your favorites",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorites. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Remove from favorites
  const { mutate: removeFromFavorites, isPending: isRemoving } = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("favorites")
        .delete()
        .match({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: (_, productId) => {
      queryClient.setQueryData(
        ["favorites", user?.id], 
        (old: string[] = []) => old.filter(id => id !== productId)
      );
      toast({
        title: "Removed from favorites",
        description: "This item has been removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle favorite status
  const toggleFavorite = (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to favorites",
      });
      return;
    }

    const isFavorite = favorites?.includes(productId);
    if (isFavorite) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(productId);
    }
  };

  // Check if a product is in favorites
  const isFavorite = (productId: string) => {
    return favorites?.includes(productId) || false;
  };

  return {
    favorites,
    loadingFavorites,
    toggleFavorite,
    isFavorite,
    isAdding,
    isRemoving
  };
};
