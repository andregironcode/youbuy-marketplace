import { SparklesCore } from "@/components/ui/sparkles";
import { ProductSection } from "@/components/product/ProductSection";
import { ProductType } from "@/types/product";
import { CategoryCards } from "./CategoryCards";
import { TrendingProducts } from "./TrendingProducts";
import { PopularNearYou } from "./PopularNearYou";

interface SparklesHomeProps {
  products: ProductType[];
  trendingProducts: ProductType[];
  isLoading: boolean;
}

export const SparklesHome = ({ products, trendingProducts, isLoading }: SparklesHomeProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section with Sparkles */}
        <div className="relative h-[60vh] w-full bg-gradient-to-br from-green-100 via-green-50 to-emerald-100">
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-white/20 z-[1]" />
          
          {/* Sparkles background */}
          <div className="absolute inset-0">
            <SparklesCore
              id="tsparticles"
              background="transparent"
              minSize={0.8}
              maxSize={1.6}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#000000"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full container mx-auto flex items-center">
            {/* Text Content */}
            <div className="flex-1 text-left px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 drop-shadow-lg">
                Welcome to YouBuy
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-2xl drop-shadow-md mb-8">
                Your one-stop marketplace for buying and selling items locally
              </p>
              <div className="flex gap-4">
                <a 
                  href="/sell" 
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Selling
                </a>
                <a 
                  href="/search" 
                  className="px-8 py-3 bg-white/80 hover:bg-white text-gray-800 font-semibold rounded-lg transition-colors backdrop-blur-sm shadow-md"
                >
                  Browse Items
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="hidden lg:block flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-50/50 z-10 rounded-3xl" />
              <img 
                src="/youbuy-homeimg.jpg" 
                alt="YouBuy Marketplace" 
                className="w-full h-full object-contain rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Category Cards */}
          <CategoryCards />
          
          {/* Trending Products */}
          <TrendingProducts products={trendingProducts} isLoading={isLoading} />
          
          {/* Popular Near You */}
          <PopularNearYou />
          
          {/* Recently Added Products */}
          <ProductSection
            title="Recently Added"
            products={products}
            link="/search?sort=newest&time=24h"
            linkText="View all new items"
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}; 