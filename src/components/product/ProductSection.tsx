
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductType } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSectionProps {
  title: string;
  products: ProductType[];
  link?: string;
  linkText?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductSection = ({
  title,
  products,
  link,
  linkText,
  isLoading = false,
  emptyMessage = "No products found"
}: ProductSectionProps) => {
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ));
  };

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {link && linkText && (
          <Link to={link} className="text-primary text-sm font-medium hover:underline">
            {linkText}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderSkeletons()}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};
