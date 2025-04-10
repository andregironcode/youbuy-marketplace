import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "💻",
    color: "bg-blue-500",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    color: "bg-pink-500",
  },
  {
    id: "home",
    name: "Home & Garden",
    icon: "🏠",
    color: "bg-green-500",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "bg-orange-500",
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    color: "bg-purple-500",
  },
  {
    id: "toys",
    name: "Toys & Games",
    icon: "🎮",
    color: "bg-red-500",
  },
];

export const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card
            className={`${category.color} cursor-pointer transition-all duration-300 hover:shadow-lg`}
            onClick={() => navigate(`/category/${category.id}`)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-32">
              <span className="text-4xl mb-2">{category.icon}</span>
              <h3 className="text-lg font-semibold text-white text-center">
                {category.name}
              </h3>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}; 