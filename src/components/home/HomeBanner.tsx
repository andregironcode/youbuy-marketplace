
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

export const HomeBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-violet-50 to-blue-50 overflow-hidden">
      <div className="container relative z-10 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Buy & sell <span className="text-youbuy">anything</span> near you
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Join the marketplace where thousands of people buy and sell unique items every day
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 max-w-xl mx-auto sm:mx-0">
              <div className="flex-1 w-full">
                <SearchBar 
                  className="w-full" 
                  placeholder="What are you looking for?" 
                  size="lg"
                />
              </div>
              <Link to="/sell" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12">
                  Start Selling
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="text-sm font-medium text-gray-500">Popular:</span>
              {["Furniture", "Electronics", "Fashion", "Cars", "Property"].map((category) => (
                <Link 
                  key={category} 
                  to={`/search?q=${category}`}
                  className="text-sm text-gray-700 hover:text-youbuy hover:underline"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                alt="People shopping and selling items" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30"></div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 max-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-youbuy/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-youbuy" />
                </div>
                <span className="font-medium">Why Choose Us?</span>
              </div>
              <p className="text-sm text-gray-500">Buy and sell with ease, secure payments, and verified sellers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background design elements */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1/3 h-1/2 bg-gradient-radial from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/3 bg-gradient-radial from-violet-200/30 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};
