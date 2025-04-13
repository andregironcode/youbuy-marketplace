import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/SearchBar";
import { motion } from "framer-motion";
import { ShoppingCart, TrendingUp, Sparkles, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { TypingText } from "@/components/ui/typing-text";
import { RainbowButton } from "@/components/ui/rainbow-button";

export const HomeBanner = () => {
  const [recentProducts, setRecentProducts] = useState<ProductType[]>([]);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('product_status', 'available')
          .order('created_at', { ascending: false })
          .limit(9);

        if (error) throw error;

        const products = data.map(item => convertToProductType(item));
        setRecentProducts(products);
      } catch (error) {
        console.error('Error fetching recent products:', error);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/30" />
      
      {/* Animated Patterns */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute h-56 w-56 rounded-full bg-primary/30 blur-3xl"
          animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute right-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
          animate={{
            x: ["0%", "-100%", "0%"],
            y: ["100%", "0%", "100%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Content */}
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-primary font-medium border border-primary/20">
                <Sparkles className="h-4 w-4" />
                Discover Amazing Products
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
            >
              Find Your Next <br />
              <span className="text-primary">Great Deal</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-muted-foreground max-w-lg"
            >
              <TypingText
                text="Join thousands of buyers and sellers in our vibrant marketplace. Discover unique items and amazing deals."
                className="text-lg"
                delay={40}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1 z-[9999]">
                <SearchBar
                  className="w-full bg-background/95 shadow-xl backdrop-blur-sm rounded-xl border-primary/20 relative z-20"
                  placeholder="What are you looking for?"
                  size="lg"
                />
              </div>
              <Link to="/sell" className="w-full sm:w-auto">
                <RainbowButton>Start Selling</RainbowButton>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-3 gap-6"
            >
              {[
                { icon: <ShoppingCart className="h-5 w-5" />, text: "Secure Payments", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                { icon: <TrendingUp className="h-5 w-5" />, text: "Best Deals", color: "bg-green-500/10 text-green-500 border-green-500/20" },
                { icon: <Sparkles className="h-5 w-5" />, text: "Verified Sellers", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-xl backdrop-blur-sm border ${item.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Recent Products Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="grid grid-cols-3 gap-4 relative">
              {recentProducts.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <motion.div
                    className="aspect-square bg-background/40 backdrop-blur-sm rounded-xl border border-primary/10 overflow-hidden group relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Product Image */}
                    <div className="w-full h-full relative">
                      <img
                        src={product.image_urls?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay with Product Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <h3 className="text-white font-medium text-sm line-clamp-2">{product.title}</h3>
                        <p className="text-primary font-bold">{formatCurrency(parseFloat(product.price))}</p>
                        <p className="text-xs text-white/80">{product.timeAgo}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
