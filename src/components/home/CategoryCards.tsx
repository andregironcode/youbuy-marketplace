
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

export const CategoryCards = () => {
  // Take only first 6 categories
  const displayCategories = categories.slice(0, 6);
  
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Browse Categories</h2>
        <Link 
          to="/categories" 
          className="text-youbuy text-sm font-medium hover:underline"
        >
          View all categories
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {displayCategories.map((category) => {
          // Generate a consistent color for each category
          const colors = [
            "bg-blue-50 text-blue-600", 
            "bg-green-50 text-green-600", 
            "bg-yellow-50 text-yellow-600", 
            "bg-red-50 text-red-600", 
            "bg-purple-50 text-purple-600", 
            "bg-pink-50 text-pink-600"
          ];
          
          const colorIndex = category.id.split('').reduce((acc, char) => 
            acc + char.charCodeAt(0), 0) % colors.length;
          
          const [bgClass, textClass] = colors[colorIndex].split(' ');
          
          return (
            <Link 
              key={category.id}
              to={`/category/${category.id}`}
              className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-youbuy group transition-all"
            >
              <div className={`p-3 rounded-full ${bgClass} mb-3 transition-transform group-hover:scale-110`}>
                <category.icon className={`h-6 w-6 ${textClass}`} />
              </div>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
