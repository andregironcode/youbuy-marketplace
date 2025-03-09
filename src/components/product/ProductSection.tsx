
import { Link } from "react-router-dom";
import { ProductType } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { ChevronRight } from "lucide-react";

interface ProductSectionProps {
  title: string;
  products: ProductType[];
  link?: string;
  linkText?: string;
}

export const ProductSection = ({ title, products, link, linkText }: ProductSectionProps) => {
  return (
    <section className="mb-10">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </section>
  );
};
