
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

const CategoryCard = ({ id, name, icon: Icon }: { id: string; name: string; icon: any }) => {
  // Dynamically generate background colors for categories
  const colors = [
    "bg-blue-50", "bg-green-50", "bg-yellow-50", "bg-red-50", 
    "bg-purple-50", "bg-pink-50", "bg-indigo-50", "bg-gray-50"
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Link 
      to={`/category/${id}`} 
      className="flex flex-col items-center rounded-lg border p-6 hover:border-youbuy transition-colors hover:shadow-sm"
    >
      <div className={`p-4 rounded-full ${randomColor} mb-4`}>
        <Icon className="h-8 w-8 text-youbuy" />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">Browse items</p>
    </Link>
  );
};

const CategoriesPage = () => {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Browse all product categories
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
        <h2 className="text-2xl font-bold mb-4">Browse by Popular Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
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
