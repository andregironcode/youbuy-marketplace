
import { Routes, Route } from "react-router-dom";
import CategoriesPage from "@/pages/CategoriesPage";

// This component can be included in the main App.tsx routes
export const CategoryRoutes = () => {
  return (
    <Routes>
      <Route path="/categories" element={<CategoriesPage />} />
    </Routes>
  );
};

// Important: Add this route to your App.tsx route structure:
// <Route path="/categories" element={<CategoriesPage />} />
