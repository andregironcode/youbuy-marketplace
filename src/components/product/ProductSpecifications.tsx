
import { ProductSpecifications as ProductSpecsType } from "@/types/product";

interface ProductSpecificationsProps {
  product: {
    specifications?: ProductSpecsType;
    category?: string;
  };
}

export const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  // If no specifications are available, don't render anything
  if (!product.specifications || Object.keys(product.specifications).length === 0) {
    return null;
  }

  // Format specification keys for display (convert camelCase to Title Case with spaces)
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  // Filter out undefined/null/empty values and internal properties
  const validSpecs = Object.entries(product.specifications).filter(
    ([key, value]) => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      !key.startsWith('_') &&
      typeof value !== 'object' // Exclude nested objects like dimensions for now
  );

  // If no valid specifications after filtering, don't render
  if (validSpecs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg mb-2">Specifications</h2>
      <div className="bg-gray-50 rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show condition as the first item if available */}
          {product.specifications.condition && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-muted-foreground">Condition</span>
              <span className="font-medium capitalize">
                {product.specifications.condition.replace(/-/g, ' ')}
              </span>
            </div>
          )}
          
          {/* List all other specifications */}
          {validSpecs.map(([key, value]) => 
            key !== 'condition' && (
              <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-muted-foreground">{formatKey(key)}</span>
                <span className="font-medium">
                  {typeof value === 'boolean' 
                    ? (value ? 'Yes' : 'No')
                    : String(value)
                  }
                </span>
              </div>
            )
          )}
          
          {/* Special handling for dimensions if available */}
          {product.specifications.dimensions && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-muted-foreground">Dimensions</span>
              <span className="font-medium">
                {`${product.specifications.dimensions.length} × ${product.specifications.dimensions.width} × ${product.specifications.dimensions.height} cm`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
