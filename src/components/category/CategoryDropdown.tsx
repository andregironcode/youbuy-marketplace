
import { useState, useEffect } from 'react';
import { categories } from '@/data/categories';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
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

export const CategoryDropdown = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // We need to handle SSR/CSR difference for the NavigationMenu
  if (!isClient) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap">
        Categories
      </Button>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent text-foreground">
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
