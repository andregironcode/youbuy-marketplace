import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Bell, PlusCircle, MessageCircle, LogIn, Wallet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UnreadBadge } from "@/components/messages/UnreadBadge";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/search/SearchBar";
import { useLocation } from "react-router-dom";
import { CategoryDropdown } from "@/components/category/CategoryDropdown";

export const Navbar = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { balance } = useWallet();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleCategories = () => {
    window.location.href = "/categories";
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotificationCount(0);
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        const { count: messageCount, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false);
        
        if (messageError) throw messageError;
        setUnreadCount(messageCount || 0);
        
        const { count: notifCount, error: notifError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (notifError) throw notifError;
        setNotificationCount(notifCount || 0);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();

    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();
      
    const notificationsChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="container flex h-16 items-center">
        <div className="mr-2 md:mr-4 flex">
          <Link to="/" className="flex items-center">
            <img src="/youbuy-logo.png" alt="YouBuy" className="h-8" />
          </Link>
        </div>

        {isMobile ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-1 md:mr-2 whitespace-nowrap"
            onClick={toggleCategories}
          >
            <Menu className="h-4 w-4 mr-1" />
            <span className="text-xs md:text-sm">Categories</span>
          </Button>
        ) : (
          <div className="mr-1 md:mr-2">
            <CategoryDropdown />
          </div>
        )}

        <div className="flex-1 mx-1 md:mx-2">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end space-x-1 md:space-x-2 ml-2">
          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  <UnreadBadge count={notificationCount} />
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/messages">
                    <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Messages">
                      <MessageCircle className="h-5 w-5" />
                      <UnreadBadge count={unreadCount} />
                    </Button>
                  </Link>
                  <Link to="/wallet">
                    <Button variant="ghost" size="sm" className="gap-2 h-9" aria-label="Wallet">
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs font-medium">${balance.toFixed(2)}</span>
                    </Button>
                  </Link>
                  <Link to="/profile" className="flex items-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?t=${Date.now()}` : undefined} 
                          className="object-cover"
                        />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">Profile</span>
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
            </>
          )}
        </div>
      </div>

      {isMobile && showMobileMenu && (
        <div className="container py-4 border-t">
          <nav className="flex flex-col space-y-3">
            {!user && (
              <Link to="/auth" className="flex items-center py-2 px-3 hover:bg-muted rounded-md">
                <LogIn className="h-4 w-4 mr-2" />
                Login/Sign-up
              </Link>
            )}
            <Link to="/sell" className="py-2 px-3 hover:bg-muted rounded-md">
              Sell an item
            </Link>
            <Link to="/notifications" className="py-2 px-3 hover:bg-muted rounded-md flex justify-between items-center">
              Notifications
              {notificationCount > 0 && (
                <Badge className="bg-youbuy">{notificationCount}</Badge>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/messages" className="py-2 px-3 hover:bg-muted rounded-md flex justify-between items-center">
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="bg-youbuy">{unreadCount}</Badge>
                  )}
                </Link>
                <Link to="/wallet" className="py-2 px-3 hover:bg-muted rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
                  </div>
                  <span className="font-medium">${balance.toFixed(2)}</span>
                </Link>
                <Link to="/profile" className="py-2 px-3 hover:bg-muted rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={signOut}
                  className="flex items-center py-2 px-3 hover:bg-muted rounded-md text-left"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
};
