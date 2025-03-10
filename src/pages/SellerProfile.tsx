
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { SellerReviews } from "@/components/product/SellerReviews";
import { SellerProfileHeader } from "@/components/seller/SellerProfileHeader";
import { SellerListings } from "@/components/seller/SellerListings";
import { SellerInformation } from "@/components/seller/SellerInformation";
import { SellerNotFound } from "@/components/seller/SellerNotFound";
import { Loader2 } from "lucide-react";
import { convertToProductType } from "@/types/product";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "listings");
  const navigate = useNavigate();

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabFromUrl && ['listings', 'reviews', 'info'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch seller profile
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) throw new Error("No seller ID provided");
      
      console.log("Fetching seller profile for ID:", id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching seller profile:", error);
        throw error;
      }
      
      console.log("Fetched seller profile:", data);
      return data;
    },
    enabled: !!id
  });

  // Fetch seller's products
  const { data: sellerProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['seller-products', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id(*)
        `)
        .eq('seller_id', id)
        .eq('product_status', 'available');
      
      if (error) throw error;
      
      return data?.map(item => convertToProductType(item)) || [];
    },
    enabled: !!id
  });

  // Fetch seller reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['seller-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('seller_reviews')
        .select('*')
        .eq('seller_id', id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  // Handle loading state
  if (isLoadingProfile || isLoadingProducts) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
          </div>
        </main>
      </div>
    );
  }

  // Handle not found state
  if (profileError || !profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <SellerNotFound />
        </main>
      </div>
    );
  }

  // Create seller info object
  const sellerInfo = {
    userId: profile.id,
    id: profile.id,
    name: profile.full_name || profile.username || "Unknown Seller",
    avatar: profile.avatar_url || '/placeholder.svg',
    joinedDate: profile.created_at,
    rating: 4.5, // Example rating (in a real app, calculate from reviews)
    totalReviews: reviews?.length || 0,
    totalListings: sellerProducts?.length || 0,
    totalSales: 0,
    totalPurchases: 0,
    totalShipments: 0,
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
              <SellerListings 
                userId={id} 
                products={sellerProducts || []} 
                isLoading={isLoadingProducts} 
              />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <SellerReviews 
                sellerId={id || ''} 
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
