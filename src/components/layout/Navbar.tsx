
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, User, Menu, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export const Navbar = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-youbuy" />
            <span className="font-bold text-xl hidden sm:inline-block">YouBuy</span>
          </Link>
        </div>

        <div className="flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 bg-muted"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" className="mr-2" onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/sell">
                <Button variant="ghost" className="font-medium">Sell</Button>
              </Link>
              <Link to="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && showMobileMenu && (
        <div className="container py-4 border-t">
          <nav className="flex flex-col space-y-3">
            <Link to="/sell" className="py-2 px-3 hover:bg-muted rounded-md">
              Sell an item
            </Link>
            <Link to="/notifications" className="py-2 px-3 hover:bg-muted rounded-md">
              Notifications
            </Link>
            <Link to="/auth" className="py-2 px-3 hover:bg-muted rounded-md">
              Sign in / Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
