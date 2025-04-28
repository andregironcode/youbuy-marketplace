import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Bell, PlusCircle, LogIn, Wallet, Search, ChevronDown, LogOut, Settings, UserCircle, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/search/SearchBar";
import { useLocation } from "react-router-dom";
import { CategoryDropdown } from "@/components/category/CategoryDropdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Function to format currency with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const Navbar = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { balance } = useWallet();
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navigateToSearch = () => {
    navigate('/search');
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const { count: notifCount, error: notifError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (notifError) throw notifError;
        setNotificationCount(notifCount || 0);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();

    const notificationsChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotificationCount();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotificationCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-0 md:mr-4 flex">
          <Link to="/" className="flex items-center">
            <img 
              src={isMobile ? "/mobile-logo.png" : "/youbuy-logo.png"} 
              alt="YouBuy" 
              className="h-10" 
            />
          </Link>
        </div>

        {/* Desktop category dropdown */}
        {!isMobile && (
          <div className="mr-1 md:mr-2">
            <CategoryDropdown />
          </div>
        )}

        {/* Search bar - both desktop and mobile */}
        <div className="flex-1 mx-1 md:mx-2">
          <SearchBar 
            size={isMobile ? "default" : "default"}
            className={isMobile ? "max-w-full" : ""}
          />
        </div>

        {/* Desktop navigation links */}
        {!isMobile && (
          <div className="flex items-center justify-end space-x-1 md:space-x-2">
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile/wallet">
                  <Button variant="ghost" size="sm" className="gap-2 h-9" aria-label="Wallet">
                    <Wallet className="h-4 w-4" />
                    <span className="text-xs font-medium">AED {formatCurrency(balance)}</span>
                  </Button>
                </Link>
                <Link to="/profile/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?t=${Date.now()}` : undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{user.user_metadata?.full_name || 'My Account'}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login/Sign-up</span>
                </Button>
              </Link>
            )}
            <Link to="/sell">
              <Button className="bg-cta hover:bg-cta-hover text-white h-9 text-sm">
                <PlusCircle className="mr-1 h-4 w-4" />
                Sell
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile menu - burger icon (moved to the right) */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open categories</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
              </SheetHeader>
              <div className="mt-6 grid gap-4">
                <CategoryDropdown mobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};
