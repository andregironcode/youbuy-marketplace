import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryGrid } from './CategoryGrid';
import { HomeBanner } from './HomeBanner';
import { ProductType } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock, Star, ChevronRight } from "lucide-react";

interface ModernHomeProps {
  products: ProductType[];
  trendingProducts: ProductType[];
  isLoading: boolean;
}

export const ModernHome = ({ products, trendingProducts, isLoading }: ModernHomeProps) => {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      products.forEach(product => {
        if (product.image_urls?.[0]) {
          const img = new Image();
          img.src = product.image_urls[0];
        }
      });
      trendingProducts.forEach(product => {
        if (product.image_urls?.[0]) {
          const img = new Image();
          img.src = product.image_urls[0];
        }
      });
    };
    preloadImages();
  }, [products, trendingProducts]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section */}
      <HomeBanner />

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-20 relative z-20">
        {/* Categories Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-background rounded-2xl shadow-lg p-8 mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 group"
              onClick={() => navigate('/categories')}
            >
              View all categories 
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <CategoryGrid />
        </motion.section>

        {/* Featured Products */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-background rounded-2xl shadow-lg p-8 mb-12"
        >
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Now
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  New Arrivals
                </TabsTrigger>
              </TabsList>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary/80 group"
                onClick={() => navigate('/search')}
              >
                View all products
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <TabsContent value="trending">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {trendingProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
            <TabsContent value="new">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* Deals Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-background rounded-2xl shadow-lg p-8 mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Today's Deals</h2>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 group"
              onClick={() => navigate('/search?deals=true')}
            >
              View all deals
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Category Browser Modal */}
        <CategoryBrowser
          open={showCategories}
          onOpenChange={setShowCategories}
          onSelectCategory={(categoryId, subcategoryId, subSubcategoryId) => {
            if (categoryId === "all") {
              navigate("/search");
            } else {
              navigate(`/search?category=${categoryId}`);
            }
            setShowCategories(false);
          }}
        />
      </main>
    </div>
  );
}; 