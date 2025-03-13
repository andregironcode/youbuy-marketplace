
import React from "react";
import { ProductEdit } from "@/components/sell/ProductEdit";

const ProductEditPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Removed the Navbar as it's already in App.tsx */}
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <ProductEdit />
        </div>
      </main>
    </div>
  );
};

export default ProductEditPage;
