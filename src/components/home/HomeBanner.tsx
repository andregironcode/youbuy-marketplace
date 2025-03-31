import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export const HomeBanner = () => {
  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(0, 179, 46)"
      gradientBackgroundEnd="rgb(0, 89, 179)"
      firstColor="18, 255, 113"
      secondColor="74, 255, 221"
      thirdColor="100, 220, 255"
      fourthColor="50, 200, 150"
      fifthColor="50, 180, 180"
      pointerColor="140, 255, 180"
      interactive={true}
      className="py-12 md:py-20"
    >
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="md:pr-8">
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
                  className="w-full h-12 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold transition-all duration-300 hover:scale-105"
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
          
          <div className="relative hidden md:block md:pl-8">
            <div className="relative h-[450px] w-[110%] -ml-[5%] rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
              <img 
                src="/youbuy-homeimg.jpg" 
                alt="Digital marketplace illustration showing devices and shopping" 
                className="w-full h-full object-cover rounded-3xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};
