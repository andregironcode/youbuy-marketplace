
import { Link } from "react-router-dom";
import { ProductType } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductSectionProps {
  title: string;
  products: ProductType[];
  link?: string;
  linkText?: string;
}

export const ProductSection = ({ title, products, link, linkText }: ProductSectionProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer for rounding errors
  };
  
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    updateScrollButtons();
    carousel.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    
    return () => {
      carousel.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);
  
  const scrollPrev = () => {
    if (!carouselRef.current) return;
    
    const containerWidth = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({
      left: -containerWidth * 0.75,
      behavior: 'smooth',
    });
  };
  
  const scrollNext = () => {
    if (!carouselRef.current) return;
    
    const containerWidth = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({
      left: containerWidth * 0.75,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mb-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {link && (
          <Link 
            to={link} 
            className="text-youbuy text-sm font-medium flex items-center hover:underline"
          >
            {linkText || "View all"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      <div className="relative">
        {/* Carousel Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/80 shadow-sm -ml-4",
            !canScrollLeft && "opacity-0 pointer-events-none"
          )}
          onClick={scrollPrev}
          disabled={!canScrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/80 shadow-sm -mr-4",
            !canScrollRight && "opacity-0 pointer-events-none"
          )}
          onClick={scrollNext}
          disabled={!canScrollRight}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
        
        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="flex items-start overflow-x-auto pb-4 pt-2 px-1 -mx-1 snap-x scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div 
              key={product.id} 
              className="flex-none px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </section>
  );
};
