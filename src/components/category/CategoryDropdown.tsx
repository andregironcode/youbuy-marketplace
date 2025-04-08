import { useState, useEffect } from 'react';
import { categories } from '@/data/categories';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// NavigationMenuLink component styled as a list item
const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string;
  title: string;
  href: string;
  children?: React.ReactNode;
}) => {
  return (
    <li className="list-none">
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

interface CategoryDropdownProps {
  mobile?: boolean;
}

export const CategoryDropdown = ({ mobile = false }: CategoryDropdownProps) => {
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleCategoriesClick = () => {
    navigate('/categories');
  };
  
  // We need to handle SSR/CSR difference for the NavigationMenu
  if (!isClient) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleCategoriesClick}
      >
        Categories
      </Button>
    );
  }

  // Mobile view renders a simple list of categories
  if (mobile) {
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <Link 
              to={`/category/${category.id}`}
              className="block py-2 text-base font-medium"
            >
              {category.name}
            </Link>
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="ml-4 space-y-1">
                {category.subCategories.slice(0, 5).map((subcategory) => (
                  <Link 
                    key={subcategory.id}
                    to={`/category/${category.id}/${subcategory.id}`}
                    className="block py-1 text-sm text-muted-foreground"
                  >
                    {subcategory.name}
                  </Link>
                ))}
                {category.subCategories.length > 5 && (
                  <Link
                    to={`/category/${category.id}`}
                    className="block py-1 text-sm text-youbuy"
                  >
                    View all in {category.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="pt-2 mt-2 border-t">
          <Link 
            to="/categories" 
            className="flex items-center text-base font-medium text-youbuy"
          >
            View all categories
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Desktop view uses the NavigationMenu
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className="bg-transparent hover:bg-accent hover:text-accent-foreground focus:bg-accent text-foreground" 
            onClick={handleCategoriesClick}
          >
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white">
              {categories.slice(0, 6).map((category) => (
                <ListItem
                  key={category.id}
                  title={category.name}
                  href={`/category/${category.id}`}
                >
                  Browse {category.name.toLowerCase()}
                </ListItem>
              ))}
              <li className="col-span-full mt-4 border-t pt-4 list-none">
                <Link 
                  to="/categories" 
                  className="flex items-center text-sm font-medium text-youbuy hover:text-youbuy-dark transition-colors"
                >
                  View all categories
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
