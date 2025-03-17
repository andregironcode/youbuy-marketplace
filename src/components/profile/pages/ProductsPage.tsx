import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SellerListings } from "@/components/seller/SellerListings";

export const ProductsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"selling" | "sold">("selling");

  useEffect(() => {
    const createUserProducts = async () => {
      if (!user) return;

      const { data: existingProducts, error } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', user.id)
        .limit(1);
        
      if (error) {
        console.error('Error checking for existing products:', error);
        return;
      }

      if (!existingProducts || existingProducts.length === 0) {
        setCreating(true);
        
        const sampleProducts = [
          {
            title: "iPhone 13 Pro - Excellent Condition",
            description: "Selling my iPhone 13 Pro (128GB). Perfect working condition with minimal scratches. Comes with original charger, cable and box. Battery health at 92%.",
            price: "2199",
            category: "electronics",
            subcategory: "smartphones",
            location: "Dubai Marina",
            image_urls: [
              "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000&auto=format&fit=crop"
            ],
            specifications: {
              brand: "Apple",
              model: "iPhone 13 Pro",
              condition: "excellent",
              storage: "128GB"
            },
            shipping_options: {
              inPersonMeetup: true,
              platformShipping: true,
              shippingCost: 25
            }
          },
          {
            title: "Sony PlayStation 5 - Digital Edition",
            description: "Brand new PS5 Digital Edition, unopened in sealed box. Includes controller and all original accessories.",
            price: "1850",
            category: "electronics",
            subcategory: "gaming",
            location: "Downtown Dubai",
            image_urls: [
              "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1000&auto=format&fit=crop"
            ],
            specifications: {
              brand: "Sony",
              model: "PlayStation 5 Digital Edition",
              condition: "new"
            },
            shipping_options: {
              inPersonMeetup: true,
              platformShipping: false
            }
          },
          {
            title: "IKEA KALLAX Shelf Unit - White",
            description: "IKEA KALLAX shelf unit in white (2x4 squares). Used for 1 year but in excellent condition. Perfect for books or room divider.",
            price: "299",
            category: "furniture",
            subcategory: "storage",
            location: "JLT",
            image_urls: [
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop"
            ],
            specifications: {
              brand: "IKEA",
              material: "Wood",
              condition: "good"
            },
            weight: "35kg",
            shipping_options: {
              inPersonMeetup: true,
              platformShipping: false
            }
          },
          {
            title: "Adidas Ultra Boost 21 - Size 42",
            description: "Adidas Ultra Boost 21 running shoes, men's size 42 (US 8.5). Bought 3 months ago, worn only a few times. Almost like new.",
            price: "450",
            category: "fashion",
            subcategory: "shoes",
            location: "The Greens",
            image_urls: [
              "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop"
            ],
            specifications: {
              brand: "Adidas",
              model: "Ultra Boost 21",
              condition: "like-new"
            },
            shipping_options: {
              inPersonMeetup: true,
              platformShipping: true,
              shippingCost: 15
            }
          },
          {
            title: "Macbook Pro 14\" (2021) - M1 Pro",
            description: "Macbook Pro 14-inch with M1 Pro chip, 16GB RAM, 512GB storage. Space gray. Purchased 1 year ago, in excellent condition.",
            price: "4999",
            category: "electronics",
            subcategory: "computers",
            location: "Business Bay",
            image_urls: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop"
            ],
            specifications: {
              brand: "Apple",
              model: "Macbook Pro 14\" (2021)",
              processor: "M1 Pro",
              ram: "16GB",
              storage: "512GB",
              condition: "excellent"
            },
            shipping_options: {
              inPersonMeetup: true,
              platformShipping: true,
              shippingCost: 50
            }
          }
        ];
        
        let successCount = 0;
        
        for (const product of sampleProducts) {
          const { error } = await supabase
            .from('products')
            .insert({
              ...product,
              seller_id: user.id,
              product_status: 'available',
              promotion_level: 'none',
              view_count: Math.floor(Math.random() * 50),
              like_count: Math.floor(Math.random() * 15)
            });

          if (error) {
            console.error('Error creating product:', error);
          } else {
            successCount++;
          }
        }
        
        if (successCount > 0) {
          toast({
            title: "Products Created",
            description: `${successCount} products have been added to your profile.`,
          });
        }
      }
    };

    createUserProducts();
  }, [user, toast]);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold">Your products</h1>
        <p className="text-muted-foreground">
          Here you can list items, manage the ones you already have and activate featured to sell them faster
        </p>
      </div>

      {creating && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-amber-800">Creating your products, please wait...</p>
        </div>
      )}

      <SellerListings 
        userId={user?.id} 
        activeTab={activeTab}
        showTabs={true}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
