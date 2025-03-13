
import React from "react";
import { ProductEdit } from "@/components/sell/ProductEdit";

const ProductEditPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <ProductEdit />
        </div>
      </main>
    </div>
  );
};

export default ProductEditPage;
