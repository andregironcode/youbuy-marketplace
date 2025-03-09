
import { ProductCard } from "@/components/product/ProductCard";
import { ProductType } from "@/types/product";

interface SellerListingsProps {
  products: ProductType[];
}

export const SellerListings = ({ products }: SellerListingsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full py-10 text-center">
          <p className="text-muted-foreground">No products listed yet</p>
        </div>
      )}
    </div>
  );
};
