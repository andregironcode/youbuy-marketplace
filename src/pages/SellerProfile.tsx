
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SellerReviews } from "@/components/product/SellerReviews";
import { SellerProfileHeader } from "@/components/seller/SellerProfileHeader";
import { SellerListings } from "@/components/seller/SellerListings";
import { SellerInformation } from "@/components/seller/SellerInformation";
import { SellerNotFound } from "@/components/seller/SellerNotFound";
import { Skeleton } from "@/components/ui/skeleton";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "listings");

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabFromUrl && ['listings', 'reviews', 'info'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch seller profile information
  const { 
    data: sellerProfile,
    isLoading: isLoadingProfile,
    error: profileError 
  } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) throw new Error("Seller ID is required");
      
      try {
        console.log("Fetching seller profile for ID:", id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error("Seller not found");
        
        return data;
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1
  });

  // Fetch seller stats (total listings, sales, etc.)
  const { 
    data: sellerStats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['seller-stats', id],
    queryFn: async () => {
      if (!id) throw new Error("Seller ID is required");
      
      try {
        // Get total available listings
        const { count: availableListings, error: listingsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', id)
          .eq('product_status', 'available');
        
        if (listingsError) throw listingsError;
        
        // Get total sold listings
        const { count: soldListings, error: soldError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', id)
          .eq('product_status', 'sold');
        
        if (soldError) throw soldError;
        
        return {
          totalListings: availableListings || 0,
          totalSales: soldListings || 0,
          totalPurchases: 0, // This would need a separate table to track purchases
          totalShipments: 0  // This would need a separate table to track shipments
        };
      } catch (error) {
        console.error("Error fetching seller stats:", error);
        return {
          totalListings: 0,
          totalSales: 0,
          totalPurchases: 0,
          totalShipments: 0
        };
      }
    },
    enabled: !!id
  });

  // Fetch total reviews count
  const { 
    data: reviewsCount,
    isLoading: isLoadingReviewsCount 
  } = useQuery({
    queryKey: ['seller-reviews-count', id],
    queryFn: async () => {
      if (!id) throw new Error("Seller ID is required");
      
      try {
        const { count, error } = await supabase
          .from('seller_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', id);
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error fetching seller reviews count:", error);
        return 0;
      }
    },
    enabled: !!id
  });

  // Fetch average rating
  const { 
    data: averageRating,
    isLoading: isLoadingRating 
  } = useQuery({
    queryKey: ['seller-average-rating', id],
    queryFn: async () => {
      if (!id) throw new Error("Seller ID is required");
      
      try {
        const { data, error } = await supabase
          .from('seller_reviews')
          .select('rating')
          .eq('seller_id', id);
        
        if (error) throw error;
        
        if (!data || data.length === 0) return 0;
        
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        return parseFloat((sum / data.length).toFixed(1));
      } catch (error) {
        console.error("Error fetching seller average rating:", error);
        return 0;
      }
    },
    enabled: !!id
  });

  const isLoading = isLoadingProfile || isLoadingStats || isLoadingReviewsCount || isLoadingRating;

  // Format the joined date
  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return format(new Date(dateString), "MMM yyyy");
    } catch (e) {
      return "Unknown";
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md rounded" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-60 w-full rounded-lg" />
                <Skeleton className="h-60 w-full rounded-lg" />
                <Skeleton className="h-60 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If seller ID is not provided or seller is not found
  if (!id || profileError || !sellerProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <SellerNotFound />
        </main>
      </div>
    );
  }

  // Construct seller info for components
  const sellerInfo = {
    userId: sellerProfile.id,
    name: sellerProfile.full_name || "Unknown Seller",
    avatar: sellerProfile.avatar_url || "",
    rating: averageRating || 0,
    totalReviews: reviewsCount || 0,
    joinedDate: formatJoinedDate(sellerProfile.created_at),
    totalListings: sellerStats?.totalListings || 0,
    totalSales: sellerStats?.totalSales || 0,
    totalPurchases: sellerStats?.totalPurchases || 0,
    totalShipments: sellerStats?.totalShipments || 0
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6">
        {/* Seller profile header */}
        <SellerProfileHeader sellerInfo={sellerInfo} />
        
        {/* Tab navigation */}
        <div className="mb-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="listings" className="text-center">
                <span className="font-semibold">{sellerInfo.totalListings}</span>
                <span className="ml-2">Published</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-center">
                <span className="font-semibold">{sellerInfo.totalReviews}</span>
                <span className="ml-2">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="text-center">
                <span className="font-semibold">+</span>
                <span className="ml-2">Info</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings" className="mt-6">
              <SellerListings userId={id} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <SellerReviews 
                sellerId={id} 
                sellerName={sellerInfo.name}
              />
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <SellerInformation />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SellerProfile;
