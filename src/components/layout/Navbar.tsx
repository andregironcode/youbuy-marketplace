
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, User, Menu, Bell, LogOut, Filter, PlusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = ({ onCategoryClick }: { onCategoryClick?: () => void }) => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
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

        <Button 
          variant="ghost" 
          size="icon"
          className="mr-2"
          onClick={onCategoryClick}
        >
          <Menu className="h-5 w-5" />Categories
        </Button>

        <div className="flex-1 mx-2">
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
              <Link to="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/sell">
                <Button className="bg-youbuy hover:bg-youbuy-dark">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Sell an item
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
            {user ? (
              <>
                <Link to="/profile" className="py-2 px-3 hover:bg-muted rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={signOut}
                  className="flex items-center py-2 px-3 hover:bg-muted rounded-md text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" className="py-2 px-3 hover:bg-muted rounded-md">
                Sign in / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
