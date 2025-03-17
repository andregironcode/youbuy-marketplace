
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { useEffect } from "react";

const CategoryCard = ({ id, name, icon: Icon }: { id: string; name: string; icon: any }) => {
  // Dynamically generate background colors for categories based on the category id
  // This provides consistent colors for the same category
  const colors = [
    "bg-blue-50 text-blue-600", "bg-green-50 text-green-600", 
    "bg-yellow-50 text-yellow-600", "bg-red-50 text-red-600", 
    "bg-purple-50 text-purple-600", "bg-pink-50 text-pink-600", 
    "bg-indigo-50 text-indigo-600", "bg-gray-50 text-gray-600"
  ];
  
  // Use hash of category id to select a consistent color
  const colorIndex = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const [bgClass, textClass] = colors[colorIndex].split(' ');

  return (
    <Link 
      to={`/category/${id}`} 
      className="flex flex-col items-center rounded-lg border p-6 hover:border-youbuy transition-colors hover:shadow-sm group"
    >
      <div className={`p-4 rounded-full ${bgClass} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-8 w-8 ${textClass}`} />
      </div>
      <h3 className="text-lg font-medium text-center">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1 text-center">Browse items</p>
    </Link>
  );
};

const CategoriesPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Find what you're looking for by browsing our product categories
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id} 
            id={category.id} 
            name={category.name} 
            icon={category.icon} 
          />
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Browse by Popular Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <category.icon className="mr-2 h-5 w-5 text-youbuy" />
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {category.subCategories.slice(0, 6).map((subCategory) => (
                    <Link 
                      key={subCategory.id} 
                      to={`/category/${category.id}/${subCategory.id}`}
                      className="text-sm hover:text-youbuy transition-colors"
                    >
                      {subCategory.name}
                    </Link>
                  ))}
                </div>
                <Link 
                  to={`/category/${category.id}`}
                  className="mt-4 inline-block text-sm font-medium text-youbuy hover:underline"
                >
                  View all in {category.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
