
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SellerReviews } from "@/components/product/SellerReviews";
import { SellerProfileHeader } from "@/components/seller/SellerProfileHeader";
import { SellerListings } from "@/components/seller/SellerListings";
import { SellerInformation } from "@/components/seller/SellerInformation";
import { SellerNotFound } from "@/components/seller/SellerNotFound";
import { formatDistance } from "date-fns";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "listings");

  // Fetch seller profile data
  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        return null;
      }
    },
    enabled: !!id
  });

  // Get seller stats
  const { data: sellerStats } = useQuery({
    queryKey: ['seller-stats', id],
    queryFn: async () => {
      if (!id) return { totalListings: 0, totalSales: 0, totalPurchases: 0, totalShipments: 0 };
      
      try {
        const { count: totalListings, error: listingsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', id);

        if (listingsError) throw listingsError;
        
        // In a real app, we would fetch these from appropriate tables
        // For now, we'll use mock data for the other stats
        return {
          totalListings: totalListings || 0,
          totalSales: Math.floor(Math.random() * 50),
          totalPurchases: Math.floor(Math.random() * 20),
          totalShipments: Math.floor(Math.random() * 30)
        };
      } catch (error) {
        console.error("Error fetching seller stats:", error);
        return { totalListings: 0, totalSales: 0, totalPurchases: 0, totalShipments: 0 };
      }
    },
    enabled: !!id
  });

  // Get seller reviews count
  const { data: reviewsCount } = useQuery({
    queryKey: ['seller-reviews-count', id],
    queryFn: async () => {
      if (!id) return 0;
      
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

  // Get seller average rating
  const { data: averageRating } = useQuery({
    queryKey: ['seller-average-rating', id],
    queryFn: async () => {
      if (!id) return 0;
      
      try {
        const { data, error } = await supabase
          .from('seller_reviews')
          .select('rating')
          .eq('seller_id', id);
        
        if (error) throw error;
        
        if (!data || data.length === 0) return 0;
        
        const total = data.reduce((sum, review) => sum + review.rating, 0);
        return total / data.length;
      } catch (error) {
        console.error("Error fetching seller average rating:", error);
        return 0;
      }
    },
    enabled: !!id
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabFromUrl && ['listings', 'reviews', 'info'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // If seller ID is not provided or seller is not found
  if (!id || ((!isLoadingProfile && !sellerProfile))) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <SellerNotFound />
        </main>
      </div>
    );
  }

  // Format joined date
  const joinedDate = sellerProfile?.created_at 
    ? formatDistance(new Date(sellerProfile.created_at), new Date(), { addSuffix: true })
    : 'recently';

  // Prepare seller info object
  const sellerInfo = {
    userId: sellerProfile?.id,
    name: sellerProfile?.full_name || 'Unnamed Seller',
    avatar: sellerProfile?.avatar_url || '/placeholder.svg',
    rating: averageRating || 0,
    totalReviews: reviewsCount || 0,
    joinedDate,
    totalListings: sellerStats?.totalListings || 0, 
    totalSales: sellerStats?.totalSales || 0,
    totalPurchases: sellerStats?.totalPurchases || 0,
    totalShipments: sellerStats?.totalShipments || 0,
    businessAccount: false
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
                <span className="font-semibold">{sellerInfo.totalListings || 0}</span>
                <span className="ml-2">Published</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-center">
                <span className="font-semibold">{sellerInfo.totalReviews || 0}</span>
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
