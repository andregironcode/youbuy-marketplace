
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "listings");

  // Find seller info from the products data (in a real app, this would come from the API)
  const sellerProducts = products.filter(p => p.seller.userId === id);
  const sellerInfo = sellerProducts.length > 0 ? sellerProducts[0].seller : null;

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabFromUrl && ['listings', 'reviews', 'info'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  if (!sellerInfo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <SellerNotFound />
        </main>
      </div>
    );
  }

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
                <span className="font-semibold">{sellerInfo.totalListings || sellerProducts.length}</span>
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
              <SellerListings products={sellerProducts} />
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
