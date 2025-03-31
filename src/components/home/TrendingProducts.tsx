import { ProductSection } from "@/components/product/ProductSection";
import { ProductType } from "@/types/product";

interface TrendingProductsProps {
  products: ProductType[];
  isLoading?: boolean;
}

export const TrendingProducts = ({ products, isLoading = false }: TrendingProductsProps) => {
  return (
    <ProductSection
      title="Trending Items"
      products={products}
      link="/search?sort=popular&time=7d"
      linkText="View all trending items"
      isLoading={isLoading}
      emptyMessage="No trending items at the moment"
    />
  );
};
