
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const sampleProducts = [
  {
    title: "iPhone 13 Pro - Excellent Condition",
    description: "Selling my iPhone 13 Pro (128GB). Perfect working condition with minimal scratches. Comes with original charger, cable and box. Battery health at 92%. No repairs or issues.",
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
    description: "Brand new PS5 Digital Edition, unopened in sealed box. Includes controller and all original accessories. Selling because I received it as a gift but already have one.",
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
    description: "IKEA KALLAX shelf unit in white (2x4 squares). Used for 1 year but in excellent condition. Perfect for books, display items, or room divider. Disassembled for easy transport.",
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
    title: "Adidas Ultra Boost 21 - Size 42 (US 8.5)",
    description: "Adidas Ultra Boost 21 running shoes, men's size 42 (US 8.5). Bought 3 months ago, worn only a few times. Almost like new. Original box included.",
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
    title: "Macbook Pro 14\" (2021) - M1 Pro 16GB RAM",
    description: "Macbook Pro 14-inch, 2021 model with M1 Pro chip, 16GB RAM, 512GB storage. Space gray. Purchased 1 year ago, in excellent condition with no scratches. Original box and charger included.",
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

export const DummyProductInserter = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateDummyProducts = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create products",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
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
          console.error('Error inserting product:', error);
          toast({
            title: "Error",
            description: `Failed to insert ${product.title}: ${error.message}`,
            variant: "destructive",
          });
        } else {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} products created successfully!`,
        });
        
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating products:', error);
      toast({
        title: "Error",
        description: "Failed to create products. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateDummyProducts} 
      disabled={loading}
      className="bg-youbuy hover:bg-youbuy-dark"
    >
      {loading ? "Creating..." : "Create Sample Products"}
    </Button>
  );
};
