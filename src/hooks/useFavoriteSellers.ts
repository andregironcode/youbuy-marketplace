
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useFavoriteSellers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorite sellers
  const { data: favoriteSellers, isLoading: loadingFavoriteSellers } = useQuery({
    queryKey: ["favorite-sellers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("favorite_sellers")
        .select("seller_id")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching favorite sellers:", error);
        return [];
      }
      
      return data.map(fav => fav.seller_id);
    },
    enabled: !!user,
  });

  // Add seller to favorites
  const { mutate: addToFavoriteSellers, isPending: isAdding } = useMutation({
    mutationFn: async (sellerId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("favorite_sellers")
        .insert({ user_id: user.id, seller_id: sellerId });
      
      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          throw new Error("Already in favorites");
        }
        throw error;
      }
    },
    onSuccess: (_, sellerId) => {
      queryClient.setQueryData(
        ["favorite-sellers", user?.id], 
        (old: string[] = []) => [...old, sellerId]
      );
      toast({
        title: "Added to favorite sellers",
        description: "This seller has been added to your favorites",
      });
    },
    onError: (error) => {
      if (error.message === "Already in favorites") {
        toast({
          title: "Already saved",
          description: "This seller is already in your favorites",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorite sellers. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Remove from favorite sellers
  const { mutate: removeFromFavoriteSellers, isPending: isRemoving } = useMutation({
    mutationFn: async (sellerId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("favorite_sellers")
        .delete()
        .match({ user_id: user.id, seller_id: sellerId });
      
      if (error) throw error;
    },
    onSuccess: (_, sellerId) => {
      queryClient.setQueryData(
        ["favorite-sellers", user?.id], 
        (old: string[] = []) => old.filter(id => id !== sellerId)
      );
      toast({
        title: "Removed from favorite sellers",
        description: "This seller has been removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorite sellers. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle favorite status
  const toggleFavoriteSeller = (sellerId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save sellers to favorites",
      });
      return;
    }

    const isFavorite = favoriteSellers?.includes(sellerId);
    if (isFavorite) {
      removeFromFavoriteSellers(sellerId);
    } else {
      addToFavoriteSellers(sellerId);
    }
  };

  // Check if a seller is in favorites
  const isFavoriteSeller = (sellerId: string) => {
    return favoriteSellers?.includes(sellerId) || false;
  };

  return {
    favoriteSellers,
    loadingFavoriteSellers,
    toggleFavoriteSeller,
    isFavoriteSeller,
    isAdding,
    isRemoving
  };
};
