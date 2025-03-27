import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

export const HomeBanner = () => {
  return (
    <div className="relative bg-gradient-to-br from-emerald-500 via-[#4CD137] to-emerald-600 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/youbuy-homeimg.jpg')] opacity-5 blur-xl bg-cover bg-center"></div>
      <div className="container relative z-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Buy & sell <span className="text-white/90">anything</span> near you
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Join the marketplace where thousands of people buy and sell unique items every day
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 max-w-xl mx-auto sm:mx-0">
              <div className="flex-1 w-full">
                <SearchBar 
                  className="w-full bg-white/95 shadow-xl backdrop-blur-sm rounded-xl" 
                  placeholder="What are you looking for?" 
                  size="lg"
                />
              </div>
              <Link to="/sell" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full h-12 bg-white text-emerald-600 hover:bg-white/90 shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Start Selling
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <span className="text-sm font-medium text-white/80">Popular:</span>
              {["Furniture", "Electronics", "Fashion", "Cars", "Property"].map((category) => (
                <Link 
                  key={category} 
                  to={`/search?q=${category}`}
                  className="text-sm text-white/90 hover:text-white hover:underline transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="relative h-[600px] w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent rounded-3xl"></div>
              <img 
                src="/youbuy-homeimg.jpg" 
                alt="Digital marketplace illustration showing devices and shopping" 
                className="w-full h-full object-contain drop-shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background design elements */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1/2 h-2/3 bg-gradient-radial from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-radial from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};
